import child_process from "node:child_process";
import { PassThrough, type Stream, Transform, type TransformCallback } from "node:stream";
import { type Glob, isAsyncFunction, isFunction, isGlob, isString } from "@wicle/is";
import { Mutex } from "@wicle/mutex";
import browserSync from "browser-sync";
import { deleteSync } from "del";
import es from "event-stream";
import changedG, { compareContents, compareLastModifiedTime } from "gulp-changed";
import debugG, { type DebugOptions } from "gulp-debug2";
import filterG from "gulp-filter";
import orderG from "gulp-order3";
import renameG from "gulp-rename";
import { pEvent } from "p-event";
import { StreamQueue } from "streamqueue";
import type Vinyl from "vinyl";
import { gulp } from "./globals.js";
import {
  anonymousTaskName,
  type BuildFunction,
  type BuildOptions,
  type CleanOptions,
  type DelOptions,
  type GulpStream,
  type PluginFunction,
  type SrcOptions,
} from "./types.js";
import arrayify from "./utils/arrayify.js";
import { type CopyOptions, type CopyParam, copy } from "./utils/copy.js";
import { flushAllStdio } from "./utils/index.js";

// --- Type aliases
type SrcMethod = typeof gulp.src;
type DestMethod = typeof gulp.dest;
type TransformFunction = (file: Vinyl, enc: BufferEncoding, callback: TransformCallback) => void;
type FlushFunction = (cb: TransformCallback) => void;
type TransformOptions = Stream.TransformOptions;

const transformConfig = { highWaterMark: 16, objectMode: true };

// --- Utility functions
function createTransform(
  transform?: TransformFunction,
  flush?: FlushFunction,
  options?: TransformOptions,
): Transform {
  return new Transform({
    ...transformConfig,
    ...options,
    transform,
    flush,
  });
}

function clearStreamG(): Transform {
  return createTransform((_file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
    cb(null);
  });
}

function cloneStreamG(): Transform {
  return createTransform((file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
    cb(null, file.clone());
  });
}

function appendG(...args: Parameters<typeof gulp.src>) {
  const pass = new PassThrough({ objectMode: true });
  return es.duplex(
    pass,
    new StreamQueue({ objectMode: true }, pass, gulp.src(...args) as Transform),
  );
}

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
  protected static nullStream(): Transform {
    return new PassThrough({ objectMode: true });
  }

  /**
   * Internal utility method to create a through stream with the given transform
   * and flush functions.
   *
   * @param transform data transformation function for each file in the stream
   * @param flush function to be called when the stream is ending
   * @param options options for the Transform stream
   * @returns A Transform stream that applies the given transform and flush functions
   */
  private static through(
    transform?: TransformFunction,
    flush?: FlushFunction,
    options?: TransformOptions,
  ): Transform {
    let isCbCalled = false;
    const _transform = ((file, enc, cb) => {
      const _cbWrpper = ((error: Error | undefined, data?: Vinyl) => {
        cb(error ?? null, data);
        isCbCalled = true;
      }) as unknown as TransformCallback;

      if (transform) transform(file, enc, _cbWrpper);
      if (!isCbCalled) cb();
    }) satisfies TransformFunction;

    const _flush = ((cb) => {
      let isCbCalled = false;
      const _cbWrapper = ((error: Error | undefined, data?: Vinyl) => {
        cb(error ?? null, data);
        isCbCalled = true;
      }) as unknown as TransformCallback;

      if (flush) flush(_cbWrapper);
      if (!isCbCalled) cb();
    }) satisfies FlushFunction;
    return createTransform(_transform, _flush, options);
  }

  /**
   * Internal method to execute the main build function with proper promise handling.
   *
   * @param bs BuildStream created by gulp task.
   * @param buildFunc BuildFunction from TaskConfig (`conf.build`).
   * @returns void or A promise to be waited by gulp task.
   */
  static async main(bs: BuildStream, buildFunc: BuildFunction) {
    await buildFunc(bs);
    if (bs.#srcCalled) bs.promise(pEvent(bs.stream, "finish"));
    await bs.#promiseQ;
    return bs.#stream;
  }

  readonly #name: string; // BuildStream instance name (same as gulp task name)
  readonly #opts: BuildOptions;
  readonly #mutex: Mutex = new Mutex();
  #stream: GulpStream = BuildStream.nullStream().end(); // call end() to make sure 'finish' event is emitted even src is not called
  #promiseQ: Promise<unknown> = Promise.resolve();
  #srcCalled = false;

  // Modern performance tracking
  readonly #performanceMetrics = {
    startTime: performance.now(),
  };

  constructor(
    name?: string,
    opts: BuildOptions = {},
    stream?: GulpStream,
    promiseQ?: Promise<unknown>,
  ) {
    this.#name = name ?? anonymousTaskName;
    this.#opts = { ...opts };
    if (stream) this.#stream = stream;
    if (promiseQ) this.#promiseQ = promiseQ;
  }

  get name() {
    return this.#name;
  }

  get className() {
    return this.constructor.name;
  }

  get stream() {
    return this.#stream;
  }

  get promiseQ() {
    return this.#promiseQ;
  }

  get opts() {
    return this.#opts;
  }

  get logger() {
    return (...args: Parameters<typeof console.log>) => this.log(...args);
  }

  /** Modern performance metrics getter */
  get performance() {
    return {
      ...this.#performanceMetrics,
      elapsedTime: performance.now() - this.#performanceMetrics.startTime,
    };
  }

  //-------------------------------------------------------------------------
  // Build API Methods: Returns value should be 'this'
  //-------------------------------------------------------------------------
  /**
   * The same as gulp.src()
   *
   * @param globsOrOptions file globs to add to build stream (string | string[]).
   * @param options SrcOptions of gulp.src()
   */
  src(globsOrOptions?: Parameters<SrcMethod>[0] | SrcOptions, options: SrcOptions = {}): this {
    globsOrOptions ??= this.#opts.src;

    let globs: Glob;
    let opts: SrcOptions;

    if (isGlob(globsOrOptions)) {
      globs = globsOrOptions;
      opts = { ...options };
    } else {
      globs = this.opts.src ?? "";
      opts = { ...(globsOrOptions as SrcOptions), ...options };
    }

    // respect opts first, and then check BuildOptions
    opts.sourcemaps ??= this.opts.sourcemaps;
    if (!isFunction(opts.sourcemaps)) opts.sourcemaps = Boolean(opts.sourcemaps);

    // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
    opts.encoding ??= false; // defaults to false

    this.#stream = gulp.src(globs as string, opts);
    this.#srcCalled = true;

    return this.order();
  }

  /**
   * Append files to current stream.
   *
   * @param globs file globs to add to build stream (string | string[]).
   * @param options SrcOptions of gulp.src()
   * @returns this
   */
  add(globs: Parameters<SrcMethod>[0], options: SrcOptions = {}): this {
    if (this.#srcCalled) this.#stream = this.#stream.pipe(appendG(globs, options)) as GulpStream;
    else this.src(globs, options);

    return this;
  }

  /**
   * Remove files from build stream with enhanced type safety
   * @param patterns file patterns to remove from build stream
   * @returns this
   */
  remove(patterns?: string | string[]): this {
    const normalizedPatterns = arrayify(patterns)
      .filter((item): item is string => typeof item === "string")
      .map((pattern) => (pattern.startsWith("!") ? pattern.slice(1) : `!${pattern}`));

    return this.filter(normalizedPatterns);
  }

  /**
   * Filter files in the stream with glob patterns using modern patterns
   * Refer to gulp-filter docs for the details
   *
   * @param args argument list of gulp-filter
   * @returns this
   */
  filter(...args: Parameters<typeof filterG>): this {
    let [patterns, opts] = args;

    if (!isFunction(patterns)) {
      const normalizedPatterns = arrayify(patterns as string).filter(
        (item): item is string => typeof item === "string",
      );

      if (normalizedPatterns.length === 0) return this;

      // Add wildcard for negation-only patterns using modern array methods
      const hasOnlyNegations = normalizedPatterns.every((pattern) => pattern.startsWith("!"));
      patterns = hasOnlyNegations ? ["*", ...normalizedPatterns] : normalizedPatterns;
    }

    return this.pipe(filterG(patterns, opts));
  }

  /**
   * Rename files in the build stream
   * Refer to gulp-rename docs for the details
   *
   * @param args argument list of gulp-rename
   * @returns this
   */
  rename(...args: Parameters<typeof renameG>): this {
    return this.pipe(renameG(...args));
  }

  /**
   * Order files in the stream
   *
   * @param args Patterns and options for ordering files in the stream.
   * @returns this
   */
  order(...args: Parameters<typeof orderG>): this {
    args[0] ??= this.opts.order;
    return this.pipe(orderG(...args));
  }

  /**
   * Filter out (remove) unchanged files in the steam.
   *
   * @param dest Destination folder path to compare against.
   * @param options Options for the changed plugin.
   * @returns this
   */
  changed(dest?: BuildOptions["dest"], options: Parameters<typeof changedG>[1] = {}): this {
    dest ??= this.opts.dest;
    if (dest === undefined || dest === null) return this;

    const opts = { ...options } satisfies Parameters<typeof changedG>[1];
    type CompareFunction = (srcFile: Vinyl, destPath: string) => Promise<Vinyl | undefined>;

    const compare: CompareFunction = async (srcFile: Vinyl, destPath: string) => {
      const lastModifiedResult = await (compareLastModifiedTime as unknown as CompareFunction)(
        srcFile,
        destPath,
      );
      return lastModifiedResult === srcFile
        ? (compareContents as unknown as CompareFunction)(srcFile, destPath)
        : undefined;
    };

    opts.hasChanged ??= compare as unknown as typeof opts.hasChanged;
    return this.pipe(changedG(dest as Parameters<typeof changedG>[0], opts));
  }

  /**
   * Copy files from source to destination.
   * Copy changed files only compared to destination counterpart.
   * Refer to 'gulp-changed' for the details.
   *
   * @param globs Source files to copy
   * @param destPath destination path to copy
   * @param opts CopyOptions
   */
  copy(globs: Glob, destPath: string, opts: CopyOptions): this;

  /**
   * Copy files from multiple sources to multiple destinations.
   *
   * @param params list of CopyParam (src to dest pairs)
   * @param opts CopyOptions
   */
  copy(params: CopyParam | CopyParam[], opts?: CopyOptions): this;

  /** implementation details */
  copy(
    arg1: Glob | CopyParam | CopyParam[],
    arg2?: string | CopyOptions,
    arg3: CopyOptions = {},
  ): this {
    copy(arg1, arg2, arg3);

    return this;
  }

  /**
   * Delete files and folders synchrously.
   *
   * @param patterns Files and folders to delete in glob pattern.
   * @param options Delete options.
   * @returns this
   */
  del(patterns: Glob, options: DelOptions = {}): this {
    const logger = options.logger ?? this.opts.logger ?? this.logger;
    if (options.logLevel !== "silent") logger(`deleting:[${arrayify(patterns).join(", ")}]`);

    deleteSync(patterns, options);
    return this;
  }

  /**
   * Delete clean targets with enhanced type safety and modern patterns
   *
   * @param cleanExtra additional clean target
   * @param options clean options including delOptions to be delivered to this.del()
   * @returns this
   */
  clean(cleanExtra: string | string[] = [], options: CleanOptions = {}): this {
    const cleanList = [...arrayify(this.opts.clean), ...arrayify(cleanExtra)];

    const logger = options.logger ?? this.logger;
    if (options.logLevel !== "silent") {
      logger(`cleaning:[${cleanList.join(", ")}]`);
    }

    return this.del(cleanList, { ...options, logLevel: "silent" });
  }

  /**
   * Execute command with enhanced error handling and modern patterns
   *
   * @param command command to be executed.
   * @param options ExecOptions to be passed to child_process.spawn().
   * @returns this
   */
  exec(command: string, options: child_process.ExecSyncOptions = {}): this {
    if (this.opts.logLevel !== "silent") this.log(`exec: '${command}'`);

    const execPromise = new Promise<string>((resolve, reject) => {
      child_process.exec(command, options, (error, stdout, stderr) => {
        if (error) {
          this.log(`error: failed to execute '${command}'`);
          if (stderr) this.log(stderr);
          if (stdout) this.log(stdout);
          reject(error);
        } else {
          if (stdout) this.log(stdout);
          if (this.opts.logLevel === "verbose") this.log(`exec: '${command}' --> done.`);
          resolve(stdout.toString());
        }
      });
    });

    return this.promise(execPromise);
  }

  /**
   * This is a wrapper to gulp.dest(), but all the parameters are optional.
   * If destination folder is not provided, the `conf.dest` is used instead.
   * If both folder argument and `conf.dest` are missing, then current
   * directory `.` is used.
   * If options.sourcemaps are not provided, then `conf.sourcemaps` is used.
   *
   * @param args THe same arguments as the original gulp.dest()
   * @returns this
   */
  dest(...args: Parameters<DestMethod> | undefined[]): this {
    const [folder = this.#opts.dest, opts = {}] = args;
    opts.sourcemaps ??= this.#opts.sourcemaps;

    this.#stream.pipe(gulp.dest(folder ?? ".", opts));
    return this;
  }

  /**
   * Reload the changes to browser-sync, if it is activated.
   *
   * @param options Options to be passed to broiwser-sync.
   * @returns BuildStream itself.
   */
  reload(options?: browserSync.StreamOptions): this {
    if (browserSync.active) this.pipe(browserSync.stream(options));
    return this;
  }

  //-------------------------------------------------------------------------
  // Stream API
  //-------------------------------------------------------------------------
  /**
   * Remove all the files in the build stream.
   *
   * @returns this
   */
  clear(): this {
    this.#stream = this.#stream.pipe(clearStreamG());
    return this;
  }

  /**
   * Clone this BuildStream instance.
   *
   * @param name Name of the cloned BuildStream instance.
   * @returns Cloned BuildStream instance.
   */
  clone(name?: string): BuildStream {
    const cloned = this.#stream.pipe(cloneStreamG());
    const bs = new BuildStream(name ?? this.#name, this.#opts, cloned, this.#promiseQ);
    return bs;
  }

  /**
   * Shortcut to bs.stream.on()
   * Add event handler to stream.     *
   *
   * @param args THe same arguments as the original bs.stream.on()
   * @returns this
   */
  on(...args: Parameters<typeof Stream.prototype.on>): this {
    (this.#stream as NodeJS.ReadWriteStream).on(...args);
    return this;
  }

  /**
   * Add func to internal promise queue.
   *
   * @param func function to be added
   */
  promise(func: () => unknown): this;

  /**
   * Add promise to internal promise queue.
   *
   * @param promise
   */
  promise(promise: Promise<unknown>): this;

  /**
   * Implementation of promise overloading
   *
   * @param arg1 funcion or promise to be added to internal promise queue
   * @returns this
   */
  promise(arg1: (() => unknown) | Promise<unknown>): this {
    this.#promiseQ =
      arg1 instanceof Promise
        ? this.#promiseQ.then(() => arg1)
        : isAsyncFunction(arg1)
          ? this.#promiseQ.then(async () => await arg1())
          : this.promiseQ.then(() => arg1());

    return this;
  }

  /**
   * Chain plugin function to build execution sequence with proper promise handling
   *
   * @param func Plugin function
   * @returns this
   */
  chain(func: PluginFunction): this {
    func(this);
    return this;
  }

  /**
   * Add gulp-plugin into build execution sequence
   *
   * @param plugin gulp plugin
   * @param options gulp-plugin options
   * @param [options.end] Whether to end the writable side of the stream when the readable side ends.
   * @returns this
   */
  pipe(plugin: GulpStream | Transform, options?: { end?: boolean }): this {
    this.#stream = this.#stream.pipe(plugin, options);

    return this;
  }

  /**
   * Print debug message using `gulp-debug2` with modern patterns
   *
   * @param title prefix that is to be added to the message.
   * @param options DebugOptions object.Refer to gulp-debug2 docs for the details.
   * @returns this
   */
  debug(title?: string, options?: DebugOptions): this;

  /**
   * Print debug message using `gulp-debug2` with modern patterns
   *
   * @param options DebugOptions object.Refer to gulp-debug2 docs for the details.
   * @returns this
   */
  debug(options?: DebugOptions): this;

  /** implementation details */
  debug(titleOrOptions: string | DebugOptions = {}, otherOptions: DebugOptions = {}): this {
    if (typeof titleOrOptions === "string") {
      titleOrOptions = { title: titleOrOptions, ...otherOptions };
    }

    const options: DebugOptions = {
      title: "debug:",
      logger: titleOrOptions.logger ?? this.logger,
      ...titleOrOptions,
      mutex: this.#mutex,
    };
    this.#stream &&= this.#stream.pipe(debugG(options));

    return this;
  }

  /**
   * Insert a transform stream into the build stream with modern patterns
   *
   * @param transform transform function
   * @param flush
   * @param options
   * @returns
   */
  through(transform?: TransformFunction, flush?: FlushFunction, options?: TransformOptions): this {
    this.#stream = this.#stream.pipe(createTransform(transform, flush, options));
    return this;
  }

  /**
   * Add a function to modify the contents of the stream.
   *
   * @param interceptFunc Function to be called for each file entry in the build stream.
   * @param onFinish Function to be called after processing all the files in the build stream.
   *
   * @returns this
   */
  intercept(
    interceptFunc?: (file: Vinyl, enc: BufferEncoding, cb: TransformCallback) => void,
    onFinish?: (cb: TransformCallback) => void,
  ): this {
    this.pipe(BuildStream.through(interceptFunc, onFinish));
    // this.pipe(createTransform(interceptFunc, onFinish))
    return this;
  }

  /**
   * Add a function to monitor the contents of the build stream with modern patterns
   *
   * @param peekFunc Function to be called for each file entry in the build stream.
   * @param onFinish Function to be called after processing all the files in the build stream.
   * @returns this
   */
  peek(peekFunc?: (file: Vinyl) => void, onFinish?: (cb: TransformCallback) => void): this {
    return this.intercept(peekFunc, onFinish);
    // return this.intercept(
    //     peekFunc
    //         ? (file, _enc, cb) => {
    //               peekFunc(file)
    //               cb(null, file)
    //           }
    //         : undefined,
    //     onFinish
    //         ? cb => {
    //               onFinish(cb)
    //               cb()
    //           }
    //         : undefined,
    // )
  }

  //-------------------------------------------------------------------------
  // Utilities
  //-------------------------------------------------------------------------
  async sync(): Promise<void> {
    await this.#promiseQ;
    await flushAllStdio();
  }

  /**
   * Synchronize the build stream with the internal promise queue.
   * This is useful to ensure that all the promises are resolved before
   * finishing the build stream.
   *
   * @returns Promise that resolves when the build stream is finished.
   */
  async finish() {
    await this.sync();
    await pEvent(this.#stream, "finish");
  }

  /**
   * Print message from this BuildStream instance with modern patterns
   *
   * @param args Items to print.
   * @returns this
   */
  log(...args: Parameters<typeof console.log>): this {
    if (args.length === 0) return this;

    const [firstArg, ...restArgs] = args;
    const prefixedArgs = isString(firstArg)
      ? [`${this.name}::${firstArg}`, ...restArgs]
      : [`${this.name}::`, firstArg, ...restArgs];

    const logger = this.opts.logger ?? console.log;
    logger(...prefixedArgs);

    return this;
  }

  /**
   * Detach the current stream from this BuildStream instance.
   * After detaching, the stream will be reset to a null stream.
   *
   * @returns The detached GulpStream.
   */
  detachStream(): GulpStream {
    const detachedStream = this.#stream;
    this.#stream = BuildStream.nullStream().end(); // reset the stream to null
    return detachedStream;
  }
}
