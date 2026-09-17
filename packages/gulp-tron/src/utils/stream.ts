import process from "node:process";
import { PassThrough, Transform, type TransformCallback, type TransformOptions } from "node:stream";
import type Vinyl from "vinyl";

export { PassThrough, Transform, type TransformCallback, type TransformOptions };

/**
 * Type definition for a transform function used in a stream.
 * @param file - Vinyl file object
 * @param enc - Buffer encoding
 * @param callback - Callback to signal completion
 */
export type TransformFunction = (
  file: Vinyl,
  enc: BufferEncoding,
  callback: TransformCallback,
) => void;

/**
 * Type definition for a flush function used in a stream.
 * @param cb - Callback to signal completion
 */
export type FlushFunction = (cb: TransformCallback) => void;

const transformConfig: TransformOptions = { highWaterMark: 16, objectMode: true };

/**
 * Utility to create a Transform stream.
 * @param transform - Function to process each chunk
 * @param flush - Function to run when the stream ends
 * @param options - Additional Transform options
 * @returns A configured Transform stream
 */
export function createTransform(
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

/**
 * Creates an empty PassThrough stream in object mode.
 * @returns A PassThrough stream
 */
export function createNullStream(): Transform {
  return new PassThrough({ objectMode: true });
}

/**
 * Flushes stdout by waiting for the drain event or forcing a write.
 * @returns Promise that resolves when stdout is flushed
 */
export async function flushStdout(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (process.stdout.writableLength === 0) return resolve();

    // flush buffered data by pushing empty string.
    const success = process.stdout.write("", (err) => {
      if (err) return reject(err);
      if (success) resolve();
    });

    // if buffer is full, then wait for drain event.
    if (!success) process.stdout.once("drain", resolve);
  });
}

/**
 * Flushes stderr by waiting for the drain event or forcing a write.
 * @returns Promise that resolves when stderr is flushed
 */
export async function flushStderr() {
  return new Promise<void>((resolve, reject) => {
    if (process.stderr.writableLength === 0) resolve();

    // flush buffered data by pushing empty string.
    const success = process.stderr.write("", (err) => {
      if (err) return reject(err);
      if (success) resolve();
    });

    // if buffer is full, then wait for drain event.
    if (!success) process.stderr.once("drain", resolve);
  });
}

/**
 * Flushes both stdout and stderr.
 */
export async function flushAllStdio() {
  await Promise.all([flushStdout(), flushStderr()]);
}

/**
 * Creates a safe Transform stream that prevents duplicate or missing callback calls
 * when mixing async and callback-based functions.
 * @param transform - Transform function
 * @param flush - Flush function
 * @param options - Transform options
 * @returns A safe Transform stream
 */
export function throughSafe(
  transform?: TransformFunction,
  flush?: FlushFunction,
  options?: TransformOptions,
): Transform {
  // Wraps a transform/flush-style function so its callback only fires
  // once, and — if the function returns a Promise (i.e. it's async) —
  // waits for that Promise to settle before falling back to an
  // unconditional `cb()`/`cb(err)` call.
  function runWithCallbackFallback<Args extends unknown[]>(
    fn: ((...args: [...Args, TransformCallback]) => unknown) | undefined,
    cb: TransformCallback,
    ...args: Args
  ): void {
    let isCbCalled = false;
    const wrappedCb = ((error?: Error | null, data?: Vinyl) => {
      if (isCbCalled) return; // ignore a duplicate/late call instead of erroring
      isCbCalled = true;
      cb(error ?? null, data);
    }) as TransformCallback;

    if (!fn) {
      wrappedCb();
      return;
    }

    const maybePromise = fn(...args, wrappedCb);
    if (maybePromise && typeof (maybePromise as Promise<unknown>).then === "function") {
      (maybePromise as Promise<unknown>).then(
        () => wrappedCb(),
        (error: Error) => wrappedCb(error),
      );
    } else if (!isCbCalled) {
      wrappedCb();
    }
  }

  const _transform = ((file, enc, cb) => {
    runWithCallbackFallback(transform, cb, file, enc);
  }) satisfies TransformFunction;

  const _flush = ((cb) => {
    runWithCallbackFallback(flush, cb);
  }) satisfies FlushFunction;
  return createTransform(_transform, _flush, options);
}

/**
 * A Transform stream that clears all incoming files (drops them).
 * @returns A Transform stream
 */
export function clearStreamG(): Transform {
  return createTransform((_file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
    cb(null);
  });
}

/**
 * A Transform stream that clones incoming Vinyl files.
 * @returns A Transform stream
 */
export function cloneStreamG(): Transform {
  return createTransform((file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
    cb(null, file.clone());
  });
}

/**
 * A Transform stream that ensures sourcemap files are paired with their main file.
 *
 * It buffers a main file until its corresponding `.map` file arrives,
 * then pushes both together downstream. This guarantees that a file is not
 * observed by later pipeline steps before its own sourcemap has finished writing.
 *
 * Assumption: When used with `gulp.dest()`, the `.map` file is always emitted
 * immediately after its main file, so this order-based logic is sufficient.
 *
 * @returns A Transform stream that pairs main files with their sourcemaps
 */
export function pairSourcemapFilesG(): Transform {
  let pendingMainFile: Vinyl | undefined;

  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _enc, cb: TransformCallback) {
      const isMapFile = file.path?.endsWith(".map") ?? false;

      if (isMapFile && pendingMainFile) {
        this.push(pendingMainFile);
        this.push(file);
        return cb();
      }

      if (pendingMainFile) {
        this.push(pendingMainFile);
      }

      if (isMapFile) {
        this.push(file);
        return cb();
      }

      pendingMainFile = file;
      cb();
    },
    flush(cb: TransformCallback) {
      if (pendingMainFile) this.push(pendingMainFile);
      cb();
    },
  });
}
