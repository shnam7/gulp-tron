import process from 'node:process'
import child_process from 'node:child_process'
import {Transform, type TransformCallback, type Stream, PassThrough} from 'node:stream'
import fs from 'node:fs'
import path from 'node:path'
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
import through from 'through2'
import {StreamQueue} from 'streamqueue'
import es from 'event-stream'
import {globbySync} from 'globby'
import is from '@wicle/is'
import {arrayify} from '../utils/index.js'
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
export type CopyOptions = {dryRun?: boolean} & LogOptions

type SrcMethod = typeof gulp.src
type DestMethod = typeof gulp.dest

function _transform(
    transform?: (file: Vinyl, enc: BufferEncoding, callback: TransformCallback) => void,
    flush?: (cb: TransformCallback) => void,
): Transform {
    return new Transform({objectMode: true, highWaterMark: 16, transform, flush})
    // return through.obj(transform, flush)
}

const clearStreamG = () =>
    _transform((file, enc, cb) => {
        cb(null)
    })

const cloneStreamG = () =>
    _transform((file, enc, cb) => {
        cb(null, file.clone())
    })

const appendG = (...args: Parameters<typeof gulp.src>) => {
    const pass = through.obj()
    return es.duplex(
        pass,
        new StreamQueue({objectMode: true}, pass, gulp.src.apply(gulp.src, args) as Transform),
    )
}

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
    static nullStream(): Transform {
        // return through.obj()
        return new PassThrough()
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

        const opts: SrcOptions = isGlob ? {...options} : globsOrOptions ? {...globsOrOptions} : {}

        // respect opts first, and then check BuildOptions
        if (!opts.sourcemaps && this.opts.sourcemaps) opts.sourcemaps = this.opts.sourcemaps
        if (!is.Function(opts.sourcemaps)) opts.sourcemaps = Boolean(opts.sourcemaps)

        // disable encoding for compatibiliy with gulp 4 in handling binary data such as images
        opts.encoding ??= false // defaults to false

        // if (this._srcCalled) return this.clear().add(globs, opts)

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
    add(globs: Parameters<SrcMethod>[0], options?: SrcOptions): this {
        if (is.String(globs) || is.Array(globs)) {
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
     * Filter out (remove) unchanged files in the steam.
     *
     * @param dest
     * @returns this
     */
    changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}): this {
        dest ??= this.opts.dest
        if (!dest) return this

        const opts = {...options}
        type T = (srcFile: Vinyl, destPath: string) => Promise<Vinyl | undefined>

        async function compare(srcFile: Vinyl, destPath: string): Promise<Vinyl | undefined> {
            return (await (compareLastModifiedTime as unknown as T)(srcFile, destPath)) === srcFile
                ? (compareContents as unknown as T)(srcFile, destPath)
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
        const cloned = this._stream.pipe(cloneStreamG())
        const bs = new BuildStream(name ?? this._name, this._opts, cloned, this._promiseSync)
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
        this._stream = this._stream.pipe(clearStreamG())
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
        const [folder = this._opts.dest, opt = {}] = args
        opt.sourcemaps ??= this._opts.sourcemaps

        this._stream.pipe(gulp.dest(folder ?? '.', opt))
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
        this._stream.on(...args)
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
        this._promiseSync =
            arg1 instanceof Promise
                ? this._promiseSync.then(async () => arg1) // eslint-disable-line promise/prefer-await-to-then
                : this._promiseSync.then(() => arg1()) // eslint-disable-line promise/prefer-await-to-then
        return this
    }

    /**
     * Chain plugin function to build execution sequence.
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
            this._stream = this._stream.pipe(gulpPlugin, options)
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
        /** function copying changed files only */
        function _copy(globs: string | string[], dest: string, opts: CopyOptions = {}) {
            const logger = opts.logger ?? console.log
            const filesToCopy = globbySync(globs)

            if (opts.logLevel !== 'silent')
                logger(`copy:['${arrayify(globs).join(', ')}'] => '${dest}':`)

            let srcStat
            let destStat
            let copyCount = 0

            for (let srcFile of filesToCopy) {
                srcFile = path.relative(process.cwd(), srcFile)
                const destFile = path.relative(
                    process.cwd(),
                    path.join(dest, path.basename(srcFile)),
                )

                ++copyCount
                srcStat = fs.statSync(srcFile)
                try {
                    destStat = fs.statSync(destFile)
                } catch (error: any) {
                    if (error.code !== 'ENOENT') throw error as Error
                }

                const copyInfo = `  ${copyCount}) ${srcFile} --> ${dest}`

                if (
                    destStat &&
                    Math.ceil(srcStat.mtimeMs) <= Math.floor(destStat.mtimeMs) &&
                    srcStat.size === destStat.size
                ) {
                    if (opts.logLevel === 'verbose') logger(`${copyInfo} (already exists.)`)
                    continue
                }

                if (opts.logLevel === 'verbose') logger(`${copyInfo}`)
                if (!opts.dryRun) {
                    fs.mkdirSync(dest, {recursive: true})
                    fs.copyFileSync(srcFile, destFile)
                }
            }

            if (opts.logLevel !== 'silent') {
                const plural = `file${filesToCopy.length > 1 ? 's' : ''}`
                logger(`  >>>: ${filesToCopy.length} ${plural} copied.`)
            }
        }

        const optCommon = {logLevel: this._opts.logLevel, logger: this.logger}
        for (const [index, item] of arrayify(arg1).entries()) {
            if (is.String(item)) _copy(item, arg2 as string, {...optCommon, ...arg3})
            else {
                const opts = {...optCommon, ...(arg2 as CopyOptions)}
                _copy(item.src, item.dest, opts)
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
     * Delete clean targets specified in `this.opts.clean`
     * and files and folders specified in `cleanExtra` additionally.
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
        childProcess.stdout?.pipe(process.stdout)
        childProcess.stderr?.pipe(process.stderr)

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
                // eslint-disable-next-line promise/prefer-await-to-then
            }).catch((error: unknown) => {
                this.log((error as Error).message)
            }),
        )
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
            mutex: this._mutex,
        }
        this._stream &&= this._stream.pipe(debugG(options))

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
        this.pipe(_transform(interceptFunc, onFinish))
        return this
    }

    /**
     * Add a function to monitor the contents of the build stream.
     *
     * @param peekFunc Function to be called for each file entry in the build stream.
     * @param onFinish Function to be called after processing all the files in the build stream.
     * @returns this
     */
    peek(peekFunc?: (file: Vinyl) => void, onFinish?: (cb: TransformCallback) => void): this {
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
     * Print message from this BuildStream instance.
     *
     * @param args Items to print.
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
