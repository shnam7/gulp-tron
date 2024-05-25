import { gulp } from './globals.js'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import child_process from 'child_process'
import order from 'gulp-order3'
import changedG, { compareContents } from 'gulp-changed'
import browserSync from 'browser-sync'
import { deleteSync } from 'del'
import { Callback, ResultCallback, Transform } from 'streamx'
import { is, arrayify } from '../utils/index.js'
import { streamToPromise } from './globals.js'
import type { BuildFunction, CleanOptions, DelOptions, ExecOptions, GulpStream, GulpTransformCallback, LogOptions, PluginFunction, SrcOptions, TaskOptions } from './types.js'
import type { Stream } from 'stream'

export type CopyParam = { src: string | string[], dest: string }
export type CopyOptions =
    & GulpChangedOptions
    & LogOptions

type SrcMethod = typeof gulp.src
type DestMethod = typeof gulp.dest
type GulpChangedOptions = NonNullable<Parameters<typeof changedG>[1]>

//--- enforce type casting to remove unnecessary null checking (null checking will be handle manually)
// const _nullStream = () => null as unknown as NodeJS.ReadWriteStream

export function _transform(func: GulpTransformCallback, onFinish?: (cb: Callback) => void): NodeJS.ReadWriteStream {
    return new Transform({
        transform: func,
        flush: onFinish
    }) as unknown as NodeJS.ReadWriteStream
}

export const cloneStream = () => _transform((file, cb) => { cb(null, file.clone()) })

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
    protected _name: string     // BuildStream instance name (same as gulp task name)
    protected _stream: GulpStream | null = null
    protected _streamStack: GulpStream[] = []
    protected _promiseSync: Promise<any> = Promise.resolve();
    protected _opts: TaskOptions

    /**
     * main build function to be executed by gulp task
     * @param bs BuildStream created by gulp task.
     * @param buildFunc BuildFunction from TaskConfig (`conf.build`).
     * @returns void or A promise to be waited by gulp task.
     */
    async _main(buildFunc: BuildFunction) {
        await buildFunc(this)
        await this._promiseSync
        // this._flushStream.pipe(this._stream)
        // this._stream.resume()

        // @ts-ignore
        // this._flushStream.pipe(debug({ logger: undefined }))
        // @ts-ignore
        // this._stream.pipe(debug({ logger: undefined }))
        // await streamToPromise(this._flushStream)
        return this._stream
    }

    constructor(name?: string, opts: TaskOptions = {}, stream?: GulpStream, promiseSync?: Promise<any>) {
        this._name = name || "<annonymous>"
        this._opts = { ...opts }
        if (stream) this._stream = stream
        if (promiseSync) this._promiseSync = promiseSync
    }

    get name() { return this._name }
    get className() { return this.constructor.name }
    get stream() { return this._stream }
    get promiseSync() { return this._promiseSync }
    get opts() { return this._opts }

    //-------------------------------------------------------------------------
    // Build API: Returns value should be 'this'
    //-------------------------------------------------------------------------

    src(options: SrcOptions): this

    src(globs?: Parameters<SrcMethod>[0], options?: SrcOptions): this


    /**
     * The same as gulp.src()
     *
     * @param globs string | string[]
     * @param options SrcOptions of gulp.src()
     */
    src(globsOrOptions?: Parameters<SrcMethod>[0] | SrcOptions, options: SrcOptions = {}): this {
        const isGlob = is.String(globsOrOptions) || is.Array(globsOrOptions)

        const globs = isGlob ? globsOrOptions : this.opts.src
        if (!globs) return this

        const opts: SrcOptions = isGlob ? { ...options }
            : globsOrOptions ? { ...globsOrOptions as SrcOptions } : {}

        // respect opts first, and then check TaskOptions
        if (!opts.sourcemaps && this.opts.sourcemaps) opts.sourcemaps = this.opts.sourcemaps

        // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
        if (!opts.encoding) opts.encoding = false

        this._stream = gulp.src(globs as string, opts)

        return this.order()
    }

    addSrc(...args: Parameters<SrcMethod>): this {
        const [globs = '', opt = {}] = args

        if (this._stream === null) return this.src(...args)

        // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
        if (!opt.encoding) opt.encoding = false

        this._stream = this._stream.pipe(gulp.src(globs, opt))
        return this
    }

    /**
     * Order files in the stream
     *
     * @param args (patterns?: string | string[], options?: Options)
     *      patterns to give priority in ordering
     * @returns this
     */
    order(...args: Parameters<typeof order>): this {
        if (!args[0]) args[0] = this.opts.order
        return this.pipe(order(...args))
    }

    /**
     * Filter stream files to changed files only comparing to dest path
     *
     * @param dest
     * @returns this
     */
    changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}): this {
        if (!dest) {
            if (!this.opts.dest) return this
            dest = this.opts.dest
        }

        const opts = { ...options }
        if (!opts.hasChanged) opts.hasChanged = compareContents

        return this.pipe(changedG(dest as Parameters<typeof changedG>[0], opts))
    }

    dest(): this        // call with no argument falls back to '.', which is current directory.

    dest(...args: Parameters<DestMethod> | []): this {
        let [folder = this._opts.dest, opt = {}] = args
        if (!opt.sourcemaps) opt.sourcemaps = this._opts.sourcemaps

        return this.pipe(gulp.dest(folder || '.', opt))
    }

    on(...args: Parameters<typeof Stream.prototype.on>): this {
        this.stream?.on(...args)
        return this
    }

    /**
     * Add func into internal promise queue
     *
     * @param func function to be added
     */
    promise(func: Function): this

    /**
     * Add promise into internal promise queue
     * @param promise
     */
    promise(promise: Promise<any>): this

    /**
     * Implementation of promise overloading
     *
     * @param arg1 funcion or promise to be added to internal promise queue
     * @returns this
     */
    promise(arg1: Function | Promise<any>): this {
        if (arg1 instanceof Promise)
            this._promiseSync = this._promiseSync.then(() => arg1)
        else
            this.then(arg1)
        return this
    }

    /**
     * Add func to internal promise queue. alias for primise(func)
     *
     * @param func Function to be excuted.
     */
    then(func: Function): this {
        this._promiseSync = this._promiseSync.then(() => { func(); return 0 })
        return this
    }

    /**
     * Add Tron plugin function into build execution sequence
     *
     * @param func Plugin function
     */
    pipe(func: PluginFunction): this

    /**
     * Add gulp-plugin into build execution sequence
     *
     * @param gulpPlugin
     * @param options
     */
    pipe(gulpPlugin: GulpStream, options?: { end?: boolean | undefined }): this

    /**
     * Add Tron plugin function or gulp-plugin into build execution sequence
     *
     * @param destination Tron plugin function or gulp-plugin
     * @param options gulp-plugin options
     * @returns this
     */
    pipe(destination: PluginFunction | GulpStream, options?: { end?: boolean | undefined }): this {
        if (typeof destination === 'function')   // PluginFunctipn
            destination(this)
        else if (this._stream)
            this._stream = this._stream.pipe(destination, options)
        return this
    }

    /**
     * Filter files in the stream with glob patterns.
     *
     * @param pattern Optional filter pattern with default valuse selecting all files except .map files.
     * @param options Filter options to be passed to gulp-filter.
     * @returns this
     */
    filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"], options: filter.Options = {}): this {
        const patterns = arrayify(pattern)
        // if (patterns[0] !== '**') patterns.unshift('**')
        return this.pipe(filter(pattern, options))
    }

    /**
     * Rename files in the build stream
     * Refer to gulp-rename docs for the details
     *
     * @param args
     * @returns
     */
    rename(...args: Parameters<typeof rename>): this {
        return this.pipe(rename(...args))
    }

    /**
     * Copy files from to destination.
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
        arg3: CopyOptions = {}
    ): this {
        /** function copying changed files only */
        const _copy = (
            globs: string | string[], dest: string,
            opts: CopyOptions & { index?: number } = {}
        ) => {

            let filesToCopy = 0
            let filesCopied = 0
            const logger = opts.logger || console.log
            const taskIDTag = opts.index ? `[${opts.index}]` : ''
            if (opts.logLevel !== 'silent') logger(`${taskIDTag}>>> copying:['${globs}' => '${dest}']:`)

            this.promise(new Promise<void>(res => {
                this
                    .pushStream(true)
                    .src(globs, { encoding: false })    // use raw binary data
                    .peek(file => { filesToCopy += 1 })
                    .pipe(changedG(dest, opts))
                    .peek(
                        file => {
                            let copyInfo = `${taskIDTag}... file:${file.path}' => '${dest}'`
                            if (opts.logLevel === 'verbose') logger(`${copyInfo}`)
                            filesCopied += 1
                        },
                        () => {
                            if (opts.logLevel !== 'silent')
                                logger(`${taskIDTag}>>> ${filesToCopy} file(s) synched (${filesCopied} files copied).`)
                        }
                    )
                    .pipe(gulp.dest(dest))
                    // .on('finish', () => {
                    //     if (opts.logLevel !== 'silent')
                    //         logger(`${taskIDTag}>>> ${filesToCopy} file(s) synched (${filesCopied} files copied).`)
                    // })
                    .on('end', () => { res() })
                    .popStream()
            }))
        }

        const optCommon = { logLevel: this._opts.logLevel, logger: this.logger }
        arrayify(arg1).forEach((item, index) => {
            if (is.String(item)) {
                const opts = { ...optCommon, ...arg3 }
                _copy(item, arg2 as string, opts)
            }
            else {
                const opts = { ...optCommon, ...arg2 as CopyOptions, index: index + 1 }
                _copy(item.src, item.dest, opts)
            }
        })

        return this
    }

    /**
     * Delete file in sync mode.
     *
     * @param patterns Files to delete.
     * @param options Options from `del` and LogOptions.
     * @returns
     */
    del(patterns: string | string[], options: DelOptions = {}): this {
        const logger = options.logger ?? this.opts.logger ?? this.logger
        if (options.logLevel !== 'silent') logger(`deleting:[${arrayify(patterns).join(', ')}]`)

        deleteSync(patterns, options)
        return this
    }

    /**
     * Clean targets specified in TasConfig.clean, and cleans cleanExtra additionally
     *
     * @param cleanExtra additional clean target
     * @param options clean options including delOptions to be delivered to this.del()
     * @returns this
     */
    clean(cleanExtra: string | string[] = [], options: CleanOptions = {}): this {
        const cleanList = arrayify(this.opts.clean).concat(arrayify(cleanExtra))

        const logger = options.logger || this.logger
        if (options.logLevel !== 'silent') logger(`cleaning:[${arrayify(cleanList).join(', ')}]`)
        options.logLevel = 'silent'

        return this.del(cleanList, options)
    }

    /**
     * Execute `command` passing it to shell.
     *
     * @param command command to be executed.
     * @param options LogOptions & Ooptions to be passed to child_process.spawn().
     * @returns
     */
    exec(command: string, options: ExecOptions): this {
        if (this.opts.logLevel !== 'silent') this.log(`Executing command:'${command}'`)
        const [cmd, ...args] = command.split(' ')
        if (!cmd) return this

        const opts: ExecOptions = { shell: true, stdio: 'pipe', ...options }
        const childProcess = child_process.spawn(cmd, args, opts)
        if (childProcess.stdout) childProcess.stdout.on('data', (data) => this.log(data.toString()))
        if (childProcess.stderr) childProcess.stderr.on('data', (data) => this.log(data.toString()))

        this.promise(new Promise((resolve, reject) => {
            childProcess.on('exit', (error: any) => {
                if (error) {
                    reject(new Error(`Tron:exec:"${cmd} ${args.join(' ')}" exited with error:${error}`))
                } else {
                    resolve(0)
                }
            })
        }).catch((error: Error) => {
            this.log(error.message)
        }))
        return this
    }

    /**
     * Clone this BuildStream
     *
     * @returns colned BuildStream
     */
    // clone(stream?: GulpStream): BuildStream {
    //     return new BuildStream(this._name, this._opts, stream || this.cloneStream(), this._promiseSync)
    // }

    // /**
    //  * Merge files, GulpStream, or BuildStream into this
    //  *
    //  * Notes: stream name of bs is discarded. bs.opts are merged into this.opts
    //  *
    //  * @param bs stream to be merged
    //  * @returns
    //  */
    // merge(bs: BuildStream): this
    // merge(globs: string | string[]): this
    // merge(stream: NodeJS.ReadableStream): this
    // merge(target: string | string[] | NodeJS.ReadableStream | BuildStream) {
    //     if (target instanceof BuildStream) {
    //         if (target == this) return this

    //         this._stream.pipe(mergeStream(this._stream, target.stream))
    //         this._opts = { ...this._opts, ...target.opts }

    //         return this
    //     }
    //     else if (is.String(target) || is.Array(target)) {
    //         this._stream.pipe(mergeStream(this._stream, gulp.src(target)))
    //     }
    //     else {
    //         this._stream.pipe(mergeStream(this._stream, target))
    //     }
    //     return this
    // }

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

    //-------------------------------------------------------------------------
    // Stream API
    //-------------------------------------------------------------------------
    /**
     * Reset current build stream to null.
     * Previoius build stream is moved to internal promise queue
     * for safe closing if it was active.
     *
     * @returns this
     */
    clearStream(): this {
        // if (this._stream) {
        //     this.promise(streamToPromise(this._stream))
        //     this._stream.emit('end')
        //     this._stream = null
        // }
        if (this._stream !== null) {
            this.promise(new Promise<void>(res => {
                this._stream!.on('end', () => res())
            }))
            this._stream = null
        }
        return this
    }

    /**
     * Push current build stream to internal stack.
     * Optionally resets current build stream.
     *
     * @param clearStream if true, current build stream is cleared. default false.
     * @returns this
     */
    pushStream(clearStream: boolean = false): this {
        if (this._stream === null) return this
        this._streamStack.push(this._stream.pipe(cloneStream()))
        if (clearStream) this.clearStream()
        return this
    }

    /**
     * If pushed stream is available, then clear current and pop the pushed stream back to cuerrent.
     *
     * @returns BuildStream itself.
     */
    popStream(): this {
        if (this._streamStack.length <= 0) return this
        this.clearStream()
        this._stream = this._streamStack.pop() as GulpStream
        return this
    }

    /**
     * Print debug message using `gulp-debug`
     *
     * @param options Options to be passed to `gulp-stream`
     * @returns this
     */
    debug(options: Parameters<typeof debug>[0] = {}): this {
        if (!(<any>options).logger) (<any>options).logger = this.logger
        // if (!options.title) options.title = ''  // remove default title

        if (this._stream) this._stream = this._stream.pipe(debug(options))

        return this
    }

    /**
     * Add a function to be modify the contents of the stream.
     *
     * @param interceptFunc Function to modify the contents of the stream.
     *
     * @returns
     */
    intercept(interceptFunc: (file: any, cb: ResultCallback<any>) => void, onFinish?: (cb: Callback) => void): this {
        this.pipe(_transform(interceptFunc, onFinish))
        return this
    }

    /**
     * Add a function to monitor the contents of the stream.
     *
     * @param peekFunc Function to monitor the contents of the stream.
     * @returns
     */
    peek(peekFunc: (file: any) => void, onFinish?: (cb: Callback) => void): this {
        return this.intercept(
            (file, cb) => { peekFunc(file); cb(null, file) },
            (cb) => { if (onFinish) onFinish(cb); cb() }
        )
    }

    //-------------------------------------------------------------------------
    // Utilities
    //-------------------------------------------------------------------------
    /**
     *
     * @param args
     * @returns
     */
    log(...args: Parameters<typeof console.log>): this {
        const logger = this.opts.logger || console.log
        logger(`${this.name}::`, ...args)
        return this
    }

    /**
     *
     */
    get logger(): typeof console.log {
        const _logger = (...args: Parameters<typeof console.log>) => {
            this.log(...args)
        }
        return _logger
    }
}
