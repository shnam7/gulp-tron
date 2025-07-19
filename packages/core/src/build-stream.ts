import {Transform, type TransformCallback, type Stream, PassThrough} from 'node:stream'
import debugG, {type DebugOptions} from 'gulp-debug2'
import filterG from 'gulp-filter'
import renameG from 'gulp-rename'
import orderG from 'gulp-order3'
import changedG, {compareLastModifiedTime, compareContents} from 'gulp-changed'
import browserSync from 'browser-sync'
import {deleteSync} from 'del'
import {Mutex} from '@wicle/mutex'
import type Vinyl from 'vinyl'
import {pEvent} from 'p-event'
import {StreamQueue} from 'streamqueue'
import es from 'event-stream'
import is from '@wicle/is'
import arrayify from './utils/arrayify.js'
import {copyFilesByGlobs, type CopyParam, type CopyOptions} from './utils/copy.js'
import {exec, type ExecOptions} from './utils/exec.js'
import {gulp} from './globals.js'
import type {
    BuildFunction,
    CleanOptions,
    DelOptions,
    GulpStream,
    PluginFunction,
    SrcOptions,
    BuildOptions,
} from './types.js'

// Modern type aliases with better semantic naming and enhanced generics
type SrcMethod = typeof gulp.src
type DestMethod = typeof gulp.dest
type TransformFunction = (file: Vinyl, enc: BufferEncoding, callback: TransformCallback) => void
type FlushFunction = (cb: TransformCallback) => void

// Enhanced constants with tuple types and better semantic naming
const transformConfig = {highWaterMark: 16, objectMode: true}
const defaultAnonymousName = '<anonymous>'

// Modern utility functions with enhanced type safety
function createTransform(transform?: TransformFunction, flush?: FlushFunction): Transform {
    return new Transform({
        ...transformConfig,
        transform,
        flush,
    })
}

// Enhanced stream utilities with proper typing and modern patterns
function clearStreamG(): Transform {
    return createTransform((_file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
        cb(null)
    })
}

function cloneStreamG(): Transform {
    return createTransform((file: Vinyl, _enc: BufferEncoding, cb: TransformCallback) => {
        cb(null, file.clone())
    })
}

function appendG(...args: Parameters<typeof gulp.src>) {
    const pass = new PassThrough({objectMode: true})
    return es.duplex(
        pass,
        new StreamQueue({objectMode: true}, pass, gulp.src(...args) as Transform),
    )
}

/*****************************************************************************
 *  Builder Pattern for BuildStream
 *****************************************************************************/
class BuildStreamBuilder {
    #name?: string
    #opts: BuildOptions = {}
    #stream?: GulpStream
    #promiseSync?: Promise<unknown>

    name(name: string): this {
        this.#name = name
        return this
    }

    options(opts: BuildOptions): this {
        this.#opts = {...this.#opts, ...opts}
        return this
    }

    stream(stream: GulpStream): this {
        this.#stream = stream
        return this
    }

    promise(promiseSync: Promise<unknown>): this {
        this.#promiseSync = promiseSync
        return this
    }

    build(): BuildStream {
        return new BuildStream(this.#name, this.#opts, this.#stream, this.#promiseSync)
    }
}

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
    static nullStream(): Transform {
        return new PassThrough()
    }

    /** Modern factory method for creating BuildStream instances */
    static create(
        name?: string,
        opts: BuildOptions = {},
        stream?: GulpStream,
        promiseSync?: Promise<unknown>,
    ): BuildStream {
        return new BuildStream(name, opts, stream, promiseSync)
    }

    /** Enhanced builder pattern factory with fluent interface */
    static builder() {
        return new BuildStreamBuilder()
    }

    readonly #name: string // BuildStream instance name (same as gulp task name)
    #stream: GulpStream = BuildStream.nullStream()
    #promiseSync: Promise<unknown> = Promise.resolve()
    readonly #opts: BuildOptions
    readonly #mutex: Mutex = new Mutex()
    #srcCalled = false

    // Modern performance tracking
    readonly #performanceMetrics = {
        startTime: performance.now(),
    }

    constructor(
        name?: string,
        opts: BuildOptions = {},
        stream?: GulpStream,
        promiseSync?: Promise<unknown>,
    ) {
        this.#name = name ?? defaultAnonymousName
        this.#opts = {...opts}
        if (stream) this.#stream = stream
        if (promiseSync) this.#promiseSync = promiseSync
    }

    /**
     * main build function to be executed by gulp task
     * @param bs BuildStream created by gulp task.
     * @param buildFunc BuildFunction from TaskConfig (`conf.build`).
     * @returns void or A promise to be waited by gulp task.
     */
    async _main(buildFunc: BuildFunction) {
        await buildFunc(this)
        await this.#promiseSync
        if (this.#srcCalled) await pEvent(this.#stream, 'finish')

        return this.#stream
    }

    get name() {
        return this.#name
    }

    get className() {
        return this.constructor.name
    }

    get stream() {
        return this.#stream
    }

    get sync() {
        return this.#promiseSync
    }

    get opts() {
        return this.#opts
    }

    /** Modern performance metrics getter */
    get performance() {
        return {
            ...this.#performanceMetrics,
            elapsedTime: performance.now() - this.#performanceMetrics.startTime,
        }
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
        const isGlob = is.String(globsOrOptions) || is.Array(globsOrOptions)
        const globs = isGlob ? globsOrOptions : this.opts.src
        if (!globs) return this

        const opts: SrcOptions = isGlob ? {...options} : {...(globsOrOptions as SrcOptions)}

        // respect opts first, and then check BuildOptions
        if (!opts.sourcemaps && this.opts.sourcemaps) opts.sourcemaps = this.opts.sourcemaps
        if (!is.Function(opts.sourcemaps)) opts.sourcemaps = Boolean(opts.sourcemaps)

        // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
        opts.encoding ??= false // defaults to false

        this.#stream = gulp.src(globs as string, opts)
        this.#srcCalled = true

        return this.order()
    }

    /**
     * Append files to current stream.
     *
     * @param globs file globs to add to build stream (string | string[]).
     * @param options SrcOptions of gulp.src()
     * @returns this
     */
    add(globs: Parameters<SrcMethod>[0], options?: SrcOptions): this {
        if (is.String(globs) || is.Array(globs)) {
            if (this.#srcCalled)
                this.#stream = this.#stream.pipe(appendG(globs, options)) as GulpStream
            else this.src(globs, options)
        }

        return this
    }

    /**
     * Remove files from build stream with enhanced type safety
     * @param patterns file patterns to remove from build stream
     * @returns this
     */
    remove(patterns?: string | string[]): this {
        const normalizedPatterns = arrayify(patterns)
            .filter((item): item is string => typeof item === 'string')
            .map(pattern => (pattern.startsWith('!') ? pattern.slice(1) : `!${pattern}`))

        return this.filter(normalizedPatterns)
    }

    /**
     * Filter files in the stream with glob patterns using modern patterns
     * Refer to gulp-filter docs for the details
     *
     * @param args argument list of gulp-filter
     * @returns this
     */
    filter(...args: Parameters<typeof filterG>): this {
        let [patterns, opts] = args

        if (!is.Function(patterns)) {
            const normalizedPatterns = arrayify(patterns as string).filter(
                (item): item is string => typeof item === 'string',
            )

            if (normalizedPatterns.length === 0) return this

            // Add wildcard for negation-only patterns using modern array methods
            const hasOnlyNegations = normalizedPatterns.every(pattern => pattern.startsWith('!'))
            patterns = hasOnlyNegations ? ['*', ...normalizedPatterns] : normalizedPatterns
        }

        return this.pipe(filterG(patterns, opts))
    }

    /**
     * Rename files in the build stream
     * Refer to gulp-rename docs for the details
     *
     * @param args argument list of gulp-rename
     * @returns this
     */
    rename(...args: Parameters<typeof renameG>): this {
        return this.pipe(renameG(...args))
    }

    /**
     * Order files in the stream
     *
     * @param args (patterns?: string | string[], options?: Options)
     *      patterns to give priority in ordering
     * @returns this
     */
    order(...args: Parameters<typeof orderG>): this {
        args[0] ??= this.opts.order
        return this.pipe(orderG(...args))
    }

    /**
     * Filter out (remove) unchanged files in the steam.
     *
     * @param dest
     * @returns this
     */
    changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}): this {
        dest ??= this.opts.dest
        if (!dest) return this

        const opts = {...options}
        type CompareFunction = (srcFile: Vinyl, destPath: string) => Promise<Vinyl | undefined>

        const compare: CompareFunction = async (srcFile: Vinyl, destPath: string) => {
            const lastModifiedResult = await (
                compareLastModifiedTime as unknown as CompareFunction
            )(srcFile, destPath)
            return lastModifiedResult === srcFile
                ? (compareContents as unknown as CompareFunction)(srcFile, destPath)
                : undefined
        }

        opts.hasChanged ??= compare as unknown as typeof opts.hasChanged
        return this.pipe(changedG(dest as Parameters<typeof changedG>[0], opts))
    }

    /**
     * Clone this BuildStream instance.
     *
     * @param name Name of the cloned BuildStream instance.
     * @returns Cloned BuildStream instance.
     */
    clone(name?: string): BuildStream {
        const cloned = this.#stream.pipe(cloneStreamG())
        const bs = new BuildStream(name ?? this.#name, this.#opts, cloned, this.#promiseSync)
        return bs
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
        this.#stream = this.#stream.pipe(clearStreamG())
        return this
    }

    /**
     * This is a wrapper to gulp.dest(), but all the parameters are optional.
     * If destination folder is not provided, the `conf.dest` is used instead.
     * If both folder argument and `conf.dest` are missing, then current
     * directory `.` is used.
     * If options.sourcemaps are not provided, then `conf.sourcemaps` is used.
     *
     * @param args THe same arguments as the original gulp.dest()
     * @returns
     */
    dest(...args: Parameters<DestMethod> | undefined[]): this {
        const [folder = this.#opts.dest, opt = {}] = args
        opt.sourcemaps ??= this.#opts.sourcemaps

        this.#stream.pipe(gulp.dest(folder ?? '.', opt))
        return this
    }

    /**
     * Shortcut to bs.stream.on()
     * Add event handler to stream.     *
     *
     * @param args THe same arguments as the original bs.stream.on()
     * @returns
     */
    on(...args: Parameters<typeof Stream.prototype.on>): this {
        this.#stream.on(...args)
        return this
    }

    /**
     * Add func to internal promise queue.
     *
     * @param func function to be added
     */
    promise(func: () => unknown): this

    /**
     * Add promise to internal promise queue.
     *
     * @param promise
     */
    promise(promise: Promise<unknown>): this

    /**
     * Implementation of promise overloading
     *
     * @param arg1 funcion or promise to be added to internal promise queue
     * @returns this
     */
    promise(arg1: (() => unknown) | Promise<unknown>): this {
        if (arg1 instanceof Promise) {
            this.#promiseSync = (async () => {
                await this.#promiseSync
                await arg1
            })()
        } else {
            this.#promiseSync = (async () => {
                await this.#promiseSync
                return arg1()
            })()
        }

        return this
    }

    /**
     * Chain plugin function to build execution sequence with proper promise handling
     *
     * @param func Plugin function
     * @returns this
     */
    chain(func: PluginFunction): this {
        func(this)
        return this
    }

    /**
     * Add gulp-plugin into build execution sequence
     *
     * @param gulpPlugin gulp plugin
     * @param options gulp-plugin options
     * @returns this
     */
    pipe(gulpPlugin: GulpStream | Transform, options?: {end?: boolean}): this {
        try {
            this.#stream = this.#stream.pipe(gulpPlugin, options)
        } catch (error: any) {
            // preventive message to avoid confusion between gulp plugin and tron plugin.
            throw is.Function(gulpPlugin)
                ? new Error(`Tron:error: use bs.chain() to use tron Plugin.`)
                : (error as Error)
        }

        return this
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
    copy(globs: string | string[], destPath: string, opts: CopyOptions): this

    /**
     * Copy files from multiple sources to multiple destinations.
     *
     * @params params list of CopyParam (src to dest pairs)
     * @param opts CopyOptions
     */
    copy(params?: CopyParam | CopyParam[], opts?: CopyOptions): this

    /** implementation details */
    copy(
        arg1?: string | string[] | CopyParam | CopyParam[],
        arg2?: string | CopyOptions,
        arg3: CopyOptions = {},
    ): this {
        const optCommon = {logLevel: this.#opts.logLevel, logger: this.logger}
        for (const [, item] of arrayify(arg1).entries()) {
            if (is.String(item)) {
                copyFilesByGlobs(item as string, arg2 as string, {...optCommon, ...arg3})
            } else {
                const opts = {...optCommon, ...(arg2 as CopyOptions)}
                copyFilesByGlobs((item as CopyParam).src, (item as CopyParam).dest, opts)
            }
        }

        return this
    }

    /**
     * Delete files and folders synchrously.
     *
     * @param patterns Files and folders to delete in glob pattern.
     * @param options Delete options.
     * @returns this
     */
    del(patterns: string | string[], options: DelOptions = {}): this {
        const logger = options.logger ?? this.opts.logger ?? this.logger
        if (options.logLevel !== 'silent') logger(`deleting:[${arrayify(patterns).join(', ')}]`)

        deleteSync(patterns, options)
        return this
    }

    /**
     * Delete clean targets with enhanced type safety and modern patterns
     *
     * @param cleanExtra additional clean target
     * @param options clean options including delOptions to be delivered to this.del()
     * @returns this
     */
    clean(cleanExtra: string | string[] = [], options: CleanOptions = {}): this {
        const cleanList = [
            ...arrayify(this.opts.clean).filter((item): item is string => typeof item === 'string'),
            ...arrayify(cleanExtra).filter((item): item is string => typeof item === 'string'),
        ]

        const logger = options.logger ?? this.logger
        if (options.logLevel !== 'silent') {
            logger(`cleaning:[${cleanList.join(', ')}]`)
        }

        const updatedOptions = {...options, logLevel: 'silent' as const}
        return this.del(cleanList, updatedOptions)
    }

    /**
     * Execute command with enhanced error handling and modern patterns
     *
     * @param command command to be executed.
     * @param options ExecOptions to be passed to child_process.spawn().
     * @returns this
     */
    exec(command: string, options: ExecOptions = {}): this {
        if (this.opts.logLevel !== 'silent') this.log(`Executing command: '${command}'`)

        // Validate command early and handle empty commands gracefully
        try {
            this.promise(exec(command, options))
        } catch (error) {
            // Convert synchronous validation errors to rejected promises
            this.promise(Promise.reject(error instanceof Error ? error : new Error(String(error))))
        }

        return this
    }

    /**
     * Reload the changes to browser-sync, if it is activated.
     *
     * @param options Options to be passed to broiwser-sync.
     * @returns BuildStream itself.
     */
    reload(options?: browserSync.StreamOptions): this {
        if (browserSync.active) this.pipe(browserSync.stream(options))
        return this
    }

    debug(title?: string, options?: DebugOptions): this

    debug(options?: DebugOptions): this

    /**
     * Print debug message using `gulp-debug2`
     *
     * @param options Options to be passed to `gulp-debug2`
     * @returns this
     */
    debug(titleOrOptions: string | DebugOptions = {}, otherOptions: DebugOptions = {}): this {
        if (typeof titleOrOptions === 'string') {
            titleOrOptions = {title: titleOrOptions, ...otherOptions}
        }

        const options: DebugOptions = {
            title: 'debug:',
            logger: titleOrOptions.logger ?? this.logger,
            ...titleOrOptions,
            mutex: this.#mutex,
        }
        this.#stream &&= this.#stream.pipe(debugG(options))

        return this
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
        interceptFunc?: (file: Vinyl, enc: BufferEncoding, cb: TransformCallback) => unknown,
        onFinish?: (cb: TransformCallback) => void,
    ): this {
        this.pipe(createTransform(interceptFunc, onFinish))
        return this
    }

    /**
     * Add a function to monitor the contents of the build stream with modern patterns
     *
     * @param peekFunc Function to be called for each file entry in the build stream.
     * @param onFinish Function to be called after processing all the files in the build stream.
     * @returns this
     */
    peek(peekFunc?: (file: Vinyl) => void, onFinish?: (cb: TransformCallback) => void): this {
        return this.intercept(
            peekFunc
                ? (file, _enc, cb) => {
                      peekFunc(file)
                      cb(null, file)
                  }
                : undefined,
            onFinish
                ? cb => {
                      onFinish(cb)
                      cb()
                  }
                : undefined,
        )
    }

    //-------------------------------------------------------------------------
    // Utilities
    //-------------------------------------------------------------------------
    /**
     * Print message from this BuildStream instance with modern patterns
     *
     * @param args Items to print.
     * @returns this
     */
    log(...args: Parameters<typeof console.log>): this {
        if (args.length === 0) return this

        const [firstArg, ...restArgs] = args
        const prefixedArgs = is.String(firstArg)
            ? [`${this.name}::${firstArg}`, ...restArgs]
            : [`${this.name}::`, firstArg, ...restArgs]

        const logger = this.opts.logger ?? console.log
        logger(...prefixedArgs)

        return this
    }

    /** Modern logger getter with normal function */
    get logger() {
        return (...args: Parameters<typeof console.log>) => {
            return this.log(...args)
        }
    }
}
