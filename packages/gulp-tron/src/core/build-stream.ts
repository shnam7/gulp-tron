import child_process from 'node:child_process'
import {Transform, type TransformCallback, type Stream} from 'node:stream'
import debugG, {type DebugOptions} from 'gulp-debug2'
import filterG from 'gulp-filter'
import renameG from 'gulp-rename'
import orderG from 'gulp-order3'
import changedG, {compareContents} from 'gulp-changed'
import browserSync from 'browser-sync'
import {deleteSync} from 'del'
import {Mutex} from '@wicle/mutex'
import type Vinyl from 'vinyl'
import {pEvent} from 'p-event'
import vinyl from 'vinyl-fs'
import through from 'through2'
import streamqueue from 'streamqueue'
import es from 'event-stream'
import {is, arrayify} from '../utils/index.js'
import {gulp} from './globals.js'
import type {
    BuildFunction,
    CleanOptions,
    DelOptions,
    ExecOptions,
    GulpStream,
    LogOptions,
    PluginFunction,
    SrcOptions,
    BuildOptions,
} from './types.js'

export type CopyParam = {src: string | string[]; dest: string}
export type CopyOptions = GulpChangedOptions & LogOptions

type SrcMethod = typeof gulp.src
type DestMethod = typeof gulp.dest
type GulpChangedOptions = NonNullable<Parameters<typeof changedG>[1]>

function _transform(
    transform?: (file: Vinyl, enc: BufferEncoding, callback: TransformCallback) => void,
    flush?: (cb: TransformCallback) => void,
): Transform {
    return new Transform({objectMode: true, highWaterMark: 16, transform, flush})
}

const clearStreamG = () =>
    _transform((file, enc, cb) => {
        cb(null)
    })

const cloneStreamG = () =>
    _transform((file, enc, cb) => {
        cb(null, file.clone())
    })

const appendG = (...args: Parameters<typeof vinyl.src>) => {
    const pass = through.obj()
    return es.duplex(
        pass,
        streamqueue({objectMode: true}, pass, vinyl.src.apply(vinyl.src, args) as Transform),
    )
}

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
    static nullStream(): Transform {
        // return through.obj()
        return _transform()
    }

    protected _name: string // BuildStream instance name (same as gulp task name)
    protected _stream: GulpStream = BuildStream.nullStream()
    protected _streamStack: GulpStream[] = []
    protected _promiseSync: Promise<unknown> = Promise.resolve()
    protected _opts: BuildOptions
    protected _mutex: Mutex = new Mutex()
    protected _srcCalled = false

    constructor(
        name?: string,
        opts: BuildOptions = {},
        stream?: GulpStream,
        promiseSync?: Promise<any>,
    ) {
        this._name = name ?? '<annonymous>'
        this._opts = {...opts}
        if (stream) this._stream = stream
        if (promiseSync) this._promiseSync = promiseSync
    }

    /**
     * main build function to be executed by gulp task
     * @param bs BuildStream created by gulp task.
     * @param buildFunc BuildFunction from TaskConfig (`conf.build`).
     * @returns void or A promise to be waited by gulp task.
     */
    async _main(buildFunc: BuildFunction) {
        await buildFunc(this)
        await this._promiseSync
        if (this._srcCalled) await pEvent(this._stream, 'finish')

        return this._stream
    }

    get name() {
        return this._name
    }

    get className() {
        return this.constructor.name
    }

    get stream() {
        return this._stream
    }

    get sync() {
        return this._promiseSync
    }

    get opts() {
        return this._opts
    }

    //-------------------------------------------------------------------------
    // Build API: Returns value should be 'this'
    //-------------------------------------------------------------------------
    src(options: SrcOptions): this

    src(globs?: Parameters<SrcMethod>[0], options?: SrcOptions): this

    /**
     * The same as gulp.src()
     *
     * @param globs file globs to add to build stream (string | string[]).
     * @param options SrcOptions of gulp.src()
     */
    src(globsOrOptions?: Parameters<SrcMethod>[0] | SrcOptions, options: SrcOptions = {}): this {
        const isGlob = is.String(globsOrOptions) || is.Array(globsOrOptions)

        const globs = isGlob ? globsOrOptions : this.opts.src
        if (!globs) return this

        const opts: SrcOptions = isGlob ? {...options} : globsOrOptions ? {...globsOrOptions} : {}

        // respect opts first, and then check TaskOptions
        if (!opts.sourcemaps && this.opts.sourcemaps) opts.sourcemaps = this.opts.sourcemaps
        if (!is.Function(opts.sourcemaps)) opts.sourcemaps = Boolean(opts.sourcemaps)

        // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
        opts.encoding ??= false // desfaults to false

        if (this._srcCalled) return this.clearStream().add(globs, opts)

        this._stream = gulp.src(globs as string, opts)
        this._srcCalled = true

        return this.order()
    }

    /**
     * Append files to current stream.
     *
     * @param globs file globs to add to build stream (string | string[]).
     * @param options SrcOptions of gulp.src()
     * @returns this
     */
    add(globs?: Parameters<SrcMethod>[0], options?: SrcOptions): this {
        if (globs) {
            if (this._srcCalled)
                this._stream = this._stream.pipe(appendG(globs, options)) as GulpStream
            else this.src(globs, options)
        }

        return this
    }

    /**
     * Remove files from build stream
     * @param patterns file patterns to remove from build stream
     *
     * @returns this
     */
    remove(patterns?: string | string[]): this {
        patterns = arrayify(patterns).map(pattern => {
            if (pattern.startsWith('!')) return pattern.slice(1)
            return '!' + pattern
        })

        return this.filter(patterns)
    }

    /**
     * Filter files in the stream with glob patterns.
     * Refer to gulp-filter docs for the details
     *
     * @param args argument list of gulp-filter
     * @returns this
     */
    filter(...args: Parameters<typeof filterG>): this {
        let [patterns, opts] = args
        if (!is.Function(patterns)) {
            patterns = arrayify(patterns)
            if (patterns.length <= 0) return this
            if (patterns.every(pattern => pattern.startsWith('!'))) patterns.unshift('*')
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
     * Filter stream files to changed files only comparing to dest path
     *
     * @param dest
     * @returns this
     */
    changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}): this {
        dest ??= this.opts.dest
        if (!dest) return this

        // if (!dest) {
        //     if (!this.options.dest) return this
        //     dest = this.options.dest
        // }

        const opts = {...options}
        opts.hasChanged ??= compareContents

        return this.pipe(changedG(dest as Parameters<typeof changedG>[0], opts))
    }

    /**
     * The same as gulp.dest()
     *
     * @param args arguments from original gulp.dest()
     * @returns
     */
    dest(...args: Parameters<DestMethod> | undefined[]): this {
        const [folder = this._opts.dest, opt = {}] = args
        opt.sourcemaps ??= this._opts.sourcemaps

        this._stream.pipe(gulp.dest(folder ?? '.', opt))
        return this
    }

    on(...args: Parameters<typeof Stream.prototype.on>): this {
        this.stream.on(...args)
        return this
    }

    /**
     * Add func into internal promise queue
     *
     * @param func function to be added
     */
    promise(func: () => unknown): this

    /**
     * Add promise into internal promise queue
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
        this._promiseSync =
            arg1 instanceof Promise
                ? this._promiseSync.then(async () => arg1)
                : this._promiseSync.then(() => arg1())
        return this
    }

    /**
     * Chain plugin function into build execution sequence
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
        this._stream = this._stream.pipe(gulpPlugin, options)
        return this
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
        arg3: CopyOptions = {},
    ): this {
        /** function copying changed files only */
        type CopyOptionsEx = CopyOptions & {index?: number}
        async function _copy(globs: string | string[], dest: string, opts: CopyOptionsEx = {}) {
            let filesToCopy = 0
            let filesCopied = 0
            const logger = opts.logger ?? console.log
            const taskIdTag = opts.index ? `[${opts.index}]` : ''

            if (opts.logLevel !== 'silent') {
                logger(`${taskIdTag}>>> copying:['${arrayify(globs).join(', ')}]' => '${dest}':`)
            }

            const bs = new BuildStream(taskIdTag)
            bs.src(globs, {encoding: false}) // use raw binary data
                .peek(() => ++filesToCopy)
                .changed(dest, opts)
                .peek(
                    file => {
                        const copyInfo = `${taskIdTag}... file:${file.path}' => '${dest}'`
                        if (opts.logLevel === 'verbose') logger(`${copyInfo}`)
                        filesCopied += 1
                    },
                    () => {
                        if (opts.logLevel !== 'silent')
                            logger(
                                `${taskIdTag}>>> ${filesToCopy} file(s) synched (${filesCopied} files copied).`,
                            )
                    },
                )
                .pipe(gulp.dest(dest))
            await pEvent(bs.stream, 'finish')
        }

        const optCommon = {logLevel: this._opts.logLevel, logger: this.logger}
        for (const [index, item] of arrayify(arg1).entries()) {
            if (is.String(item)) {
                this.promise(_copy(item, arg2 as string, {...optCommon, ...arg3}))
            } else {
                const opts = {...optCommon, ...(arg2 as CopyOptions), index: index + 1}
                this.promise(_copy(item.src, item.dest, opts))
            }
        }

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
        const cleanList = [...arrayify(this.opts.clean), ...arrayify(cleanExtra)]

        const logger = options.logger ?? this.logger
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

        const opts: ExecOptions = {shell: true, stdio: 'pipe', ...options}
        const childProcess = child_process.spawn(cmd, args, opts)
        if (childProcess.stdout) childProcess.stdout.on('data', data => this.log(data))
        if (childProcess.stderr) childProcess.stderr.on('data', data => this.log(data))

        this.promise(
            new Promise((resolve, reject) => {
                childProcess.on('exit', (error: any) => {
                    if (error) {
                        reject(
                            new Error(
                                `Tron:exec:"${cmd} ${args.join(' ')}" exited with error:${error}`,
                            ),
                        )
                    } else {
                        resolve(0)
                    }
                })
            }).catch((error: Error) => {
                this.log(error.message)
            }),
        )
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
        this._stream = this._stream.pipe(clearStreamG())
        return this
    }

    // /**
    //  * Push current build stream to internal stack.
    //  * Optionally resets current build stream.
    //  *
    //  * @param clearStream if true, current build stream is cleared. default false.
    //  * @returns this
    //  */
    // pushStream(clearStream = false): this {
    //     if (this._stream === null) return this
    //     this._streamStack.push(this._stream.pipe(cloneStreamG()))
    //     if (clearStream) this.clearStream()
    //     return this
    // }

    // /**
    //  * If pushed stream is available, then clear current and pop the pushed stream back to cuerrent.
    //  *
    //  * @returns BuildStream itself.
    //  */
    // popStream(): this {
    //     if (this._streamStack.length <= 0) return this
    //     this.clearStream()
    //     this._stream = this._streamStack.pop()!
    //     return this
    // }

    debug(title?: string, options?: DebugOptions): this

    debug(options?: DebugOptions): this

    /**
     * Print debug message using `gulp-debug`
     *
     * @param options Options to be passed to `gulp-stream`
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
            mutex: this._mutex,
        }
        this._stream &&= this._stream.pipe(debugG(options))

        return this
    }

    /**
     * Add a function to be modify the contents of the stream.
     *
     * @param interceptFunc Function to modify the contents of the stream.
     *
     * @returns
     */
    intercept(
        interceptFunc?: (file: Vinyl, enc: BufferEncoding, cb: TransformCallback) => unknown,
        onFinish?: (cb: TransformCallback) => void,
    ): this {
        this.pipe(_transform(interceptFunc, onFinish))
        return this
    }

    /**
     * Add a function to monitor the contents of the stream.
     *
     * @param peekFunc Function to monitor the contents of the stream.
     * @returns
     */
    peek(peekFunc?: (file: any) => void, onFinish?: (cb: TransformCallback) => void): this {
        return this.intercept(
            peekFunc
                ? (file, enc, cb) => {
                      peekFunc(file)
                      cb(null, file)
                  }
                : undefined,
            cb => {
                if (onFinish) onFinish(cb)
                cb()
            },
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
        if (args.length <= 0) return this
        if (is.String(args[0])) args[0] = `${this.name}::${args[0]}`
        else args.unshift(`${this.name}::`)

        const logger = this.opts.logger ?? console.log
        logger(...args)
        // logger(`${this.name}::`, ...args)

        return this
    }

    get logger(): typeof console.log {
        return (...args: Parameters<typeof console.log>) => this.log(...args)
    }
}
