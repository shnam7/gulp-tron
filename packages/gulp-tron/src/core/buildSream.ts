import gulp, { DestMethod, SrcMethod } from 'gulp'
import browserSync from 'browser-sync'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import streamToPromise from 'stream-to-promise'
import child_process from 'child_process'
import arrayify from '../utils/arrayify.js'
import { deleteSync } from 'del'
import type { CleanOptions, DelOptions, ExecOptions, GulpStream, LogOptions, PluginFunction, TaskOptions } from './types.js'
import mergeStream from 'merge-stream'
import order from 'gulp-order3'
import { is, cloneStream } from '../utils/index.js'
import newerG from 'gulp-newer'
import through2 from 'through2'

export type CopyParam = { src: string | string[], dest: string }
export type CopyOptions =
    & Partial<Parameters<typeof newerG>[0]>
    & LogOptions

const _nullStream = () => gulp.src('./initial-dummy/**/*.dummy')

/**
 *  Gulp stream wrapper with API for build processing.
 */

/*****************************************************************************
 *  Gulp Stream Wrapper providing API for build processing.
 *****************************************************************************/
export class BuildStream {
    protected _name: string     // BuildStream instance name
    protected _stream: GulpStream = _nullStream()
    protected _promiseSync: Promise<any> = Promise.resolve();
    protected _opts: TaskOptions

    constructor(name?: string, opts: TaskOptions = {}, stream?: GulpStream, promiseSync?: Promise<any>) {
        this._name = name || "<annonymous>"
        this._opts = { ...opts }
        if (stream) this._stream = stream
        if (promiseSync) this._promiseSync = promiseSync
    }

    get name() { return this._name }
    get className() { return this.constructor.name }
    get stream() { return this._stream }
    get opts() { return this._opts }

    //-------------------------------------------------------------------------
    // Build API: Returns value should be 'this'
    //-------------------------------------------------------------------------
    src(options: Parameters<SrcMethod>[1]): this
    src(globs: Parameters<SrcMethod>[0], options?: Parameters<SrcMethod>[1]): this
    src(globsOrOpts: Parameters<SrcMethod>[0] | Parameters<SrcMethod>[1], options: Parameters<SrcMethod>[1] = {}): this {

        let globs = this._opts.src || ''
        let opt = { sourcemaps: !!this._opts.sourcemaps, ...options }
        if (is.String(globsOrOpts) || is.Array(globsOrOpts))
            globs = globsOrOpts
        else
            opt = { ...opt, ...globsOrOpts }

        this._stream = gulp.src(globs, opt)
        return this.order()
    }

    addSrc(...args: Parameters<SrcMethod>): this {
        const [globs = '', opt = {}] = args
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
    order(...args: Parameters<typeof order>) {
        if (!args[0]) args[0] = this.opts.order
        return this.pipe(order(...args))
    }

    /**
     * Filter stream files to newer files only comparing to dest path
     *
     * @param dest
     * @returns this
     */
    newer(dest?: string): this {
        if (!dest) dest = is.String(this.opts.dest) ? this.opts.dest : undefined
        if (!dest) return this

        return this.pipe(newerG(dest))
    }

    dest(): this        // call with no argument falls back to '.', which is current directory.
    dest(...args: Parameters<DestMethod> | []): this {
        let [folder = this._opts.dest, opt = {}] = args
        if (!opt.sourcemaps) opt.sourcemaps = this._opts.sourcemaps

        return this.pipe(gulp.dest(folder || '.', opt))
    }

    on(...args: Parameters<typeof this._stream.on>): this {
        this.stream.on(...args)
        return this
    }

    then(func: Function) {
        this._promiseSync = this._promiseSync.then(() => func())
    }

    promise(promise: Promise<any>): this {
        this._promiseSync = this._promiseSync.then(() => promise)
        return this
    }

    pipe(func: PluginFunction): this
    pipe(destination: GulpStream, options?: { end?: boolean | undefined }): this
    pipe(destination: PluginFunction | GulpStream, options?: { end?: boolean | undefined }): this {
        if (typeof destination == 'function')   // PluginFunctipn
            destination(this)
        else
            this._stream = this._stream.pipe(destination, options)
        return this
    }

    debug(...args: Parameters<typeof debug>): this {
        this._stream = this._stream.pipe(debug(...args))
        return this
    }

    filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"], options: filter.Options = {}): this {
        const patterns = arrayify(pattern)
        if (patterns[0] !== '**') patterns.unshift('**')
        return this.pipe(filter(pattern, options))
    }

    rename(...args: Parameters<typeof rename>): this {
        return this.pipe(rename(...args))
    }

    /**
     * Copy files from to destination.
     * Copy newer files only compared to destination counterpart.
     * Refer to 'gulp-newer' for the details.
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
        arg2?: string | CopyOptions, arg3: CopyOptions = {}
    ): this {

        /** function copying newer files only */
        const _copy = async (globs: string | string[], dest: string,
            opts: CopyOptions & { index?: number } = {}) => {

            let filesToCopy = 0
            let filesCopied = 0
            const logger = opts.logger || console.log
            const taskIDTag = `(${opts.index})`
            if (opts.logLevel !== 'silent') logger(`${taskIDTag}... copying:['${globs}' => '${dest}']:`)

            const promise = new Promise((done: Function) => {

                gulp.src(globs)
                    .pipe(through2.obj((file, encoding, callback) => {
                        filesToCopy += 1
                        callback(null, file)
                    }))
                    .pipe(newerG({ ...opts, dest: dest, }))
                    .pipe(through2.obj((file, encoding, callback) => {
                        let copyInfo = `${taskIDTag}${file.path}' => '${dest}'`
                        if (opts.logLevel !== 'silent') logger(`${copyInfo}`)
                        filesCopied += 1
                        callback(null, file)
                    }))
                    .pipe(gulp.dest(dest))
                    .on('finish', () => {
                        if (opts.logLevel !== 'silent')
                            logger(`${taskIDTag}..... ${filesToCopy} file(s) synched (${filesCopied} files copied).`)
                        done()
                    })

            })
            this.promise(promise)
        }

        const optCommon = { logLevel: this._opts.logLevel, logger: this.logger }
        if (typeof arg1 === 'string' || Array.isArray(arg1) && typeof arg1[0] === 'string') {
            const opts = { ...optCommon, ...arg3, index: 1 }
            // this.promise(_copy(arg1 as string | string[], arg2 as string, opts))
            _copy(arg1 as string | string[], arg2 as string, opts)
        }
        else {
            const params = arrayify(arg1 as CopyParam | CopyParam[])
            params.map(async (param, index) => {
                const opts = { ...optCommon, ...arg2 as CopyOptions, index: index + 1 }
                // this.promise(_copy(param.src, param.dest, opts))
                _copy(param.src, param.dest, opts)
            })
        }
        return this
    }

    del(patterns: string | string[], options: DelOptions = {}): this {
        const opts: DelOptions = { ...this.opts, ...options }
        const logger = opts.logger || this.logger

        if (opts.logLevel !== 'silent') logger(`deleting:[${arrayify(patterns).join(', ')}]`)
        deleteSync(patterns, opts)
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

    exec(command: string, options: ExecOptions): this {
        if (this.opts.logLevel !== 'silent') this.log(`Executing command:'${command}'`)
        const [cmd, ...args] = command.split(' ')
        if (!cmd) return this

        const opts: ExecOptions = { shell: true, stdio: 'pipe', ...options }
        const childProcess = child_process.spawn(cmd, args, opts)
        if (childProcess.stdout) childProcess.stdout.on('data', (data) => console.log(data.toString()))
        if (childProcess.stderr) childProcess.stderr.on('data', (data) => console.log(data.toString()))

        this.promise(new Promise((resolve, reject) => {
            childProcess.on('exit', (error: any) => {
                if (error) {
                    reject(new Error(`Tron:exec:"${cmd} ${args.join(' ')}" exited with error:${error}`))
                } else
                    resolve(0)
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
    clone(): BuildStream {
        return new BuildStream(this._name, this._opts, this.cloneStream(), this._promiseSync)
    }

    /**
     * Merge files, GulpStream, or BuildStream into this
     *
     * Notes: stream name of bs is discarded. bs.opts are merged into this.opts
     *
     * @param bs stream to be merged
     * @returns
     */
    merge(bs: BuildStream): this
    merge(globs: string | string[]): this
    merge(stream: GulpStream): this
    merge(target: string | string[] | GulpStream | BuildStream) {
        if (target instanceof BuildStream) {
            this._stream = mergeStream(this._stream, target.stream)
            this.promise(this._promiseSync)
            this._opts = { ...this._opts, ...target.opts }
            return this
        }
        else {
            this._stream = mergeStream(this._stream, is.String(target) || is.Array(target) ? gulp.src(target) : target)
        }
        return this
    }

    log(...args: Parameters<typeof console.log>): this {
        const logger = this.opts.logger || console.log
        this._promiseSync.then(() => { logger(...args) })
        return this
    }

    clearStream(): this {
        this._stream = _nullStream()
        return this
    }

    reload(options?: browserSync.StreamOptions): this {
        if (browserSync.active) this.pipe(browserSync.stream(options))
        return this
    }

    //-------------------------------------------------------------------------
    // Stream API
    //-------------------------------------------------------------------------
    createStream(): GulpStream { return _nullStream() }

    cloneStream(): GulpStream { return this.pipe(cloneStream())._stream }

    async flushStream(): Promise<any> {
        await this._promiseSync
        await streamToPromise(this._stream)
        return this._promiseSync
    }

    //-------------------------------------------------------------------------
    // Utilities
    //-------------------------------------------------------------------------
    get logger(): typeof console.log {
        const _logger = (...args: Parameters<typeof console.log>) => {
            this.log(...args)
        }
        return _logger
    }
}
