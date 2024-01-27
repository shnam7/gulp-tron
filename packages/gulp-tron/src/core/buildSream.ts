/**
 *  Builder Base Class
 */

import gulp, { DestMethod, SrcMethod } from 'gulp'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import type { GulpStream, PluginFunction } from './types.js'
import streamToPromise from 'stream-to-promise'


//--- GBuilder
export class BuildStream {
    protected _name: string
    protected _stream: GulpStream = gulp.src('./initial-dummy/**/*.dummy')
    protected _promiseSync: Promise<any> = Promise.resolve();

    constructor(name: string) { this._name = name }

    get name() { return this._name }
    get className() { return this.constructor.name }
    get stream() { return this._stream }

    /**----------------------------------------------------------------
     * Build API: Returns value should be 'this'
     *----------------------------------------------------------------*/
    src(...args: Parameters<SrcMethod>): this {
        const [globs, opt] = args
        if (opt?.sourcemaps) opt.sourcemaps = !!opt.sourcemaps  // convert type to boolean
        this._stream = gulp.src(globs, opt)
        return this
    }

    dest(...args: Parameters<DestMethod>): this {
        const [folder, opt] = args
        return this.pipe(gulp.dest(folder, opt))
    }

    async flush(): Promise<void> {
        await this._promiseSync
        await streamToPromise(this._stream)
    }

    pipe(func: PluginFunction): this
    pipe(destination: GulpStream, options?: { end?: boolean | undefined }): this
    pipe(destination: PluginFunction | GulpStream, options?: { end?: boolean | undefined }): this {
        if (typeof destination == 'function')
            destination(this, {})
        else
            this._stream = this._stream.pipe(destination, options)
        return this
    }

    // pipe(...args: Parameters<ReturnType<SrcMethod>['pipe']>): this {
    //     this._stream = this._stream.pipe(...args) as GulpStream
    //     return this
    // }

    //--- accept function or promise
    // promise(promise?: Promise<any> | void | PromiseExecutor): this {
    //     if (promise instanceof Promise)
    //         this._promiseSync = this._promiseSync.then(() => promise)
    //     else if (is.Function(promise)) {
    //         this._promiseSync = this._promiseSync.then(promise as PromiseExecutor)
    //     }
    //     return this
    // }

    // pushStream(): this {
    //     this._streamQ.push(this._stream)
    //     this._stream = this._stream.pipe(cloneStream())
    //     return this
    // }

    // popStream(): this {
    //     if (this._streamQ.length > 0) {
    //         if (this._stream) this.promise(streamToPromise(this._stream))  // promise for flushing
    //         const stream = this._streamQ.pop()
    //         if (stream) this._stream = stream
    //     }
    //     return this
    // }

    debug(...args: Parameters<typeof debug>): this {
        this._stream = this._stream.pipe(debug(...args))
        return this
    }

    filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"], options: filter.Options = {}): this {
        return this.pipe(filter(pattern, options))
    }

    rename(...args: Parameters<typeof rename>): this {
        return this.pipe(rename(...args))
    }

    // copy(param?: CopyParam | CopyParam[], options: Options = {}): this {
    //     if (!param) return this   // allow null argument

    //     const verbose = this.conf.verbose || options.verbose
    //     const _copy = (target: any): void => {
    //         let copyInfo = `[${target.src}] => ${target.dest}`
    //         if (verbose) msg(`[${this.name}]:copying: ${copyInfo}`)
    //         copy(target.src, target.dest)
    //         // .then(() => { if (verbose) msg(`[${this.name}]:copying: ${copyInfo} --> done`) })
    //     }
    //     arrayify(param).forEach(target => _copy(target))
    //     return this
    // }

    // del(patterns: string | string[], options: Options = {}): this {
    //     let silent = this.conf.silent || options.silent
    //     if (!silent) msg('Deleting:', patterns)
    //     del.deleteSync(patterns, options)
    //     return this
    // }

    // exec(cmd: string | ExternalCommand, args: string[] = [], options: SpawnOptions = {}): this {
    //     return this.promise(() => exec(cmd, args, options))
    // }

    // clean(cleanList: string | string[] = [], options: CleanOptions = {}): this {
    //     cleanList = arrayify(this.conf.clean).concat(arrayify(cleanList));
    //     return this.del(cleanList, options);
    // }


    // //--- Stream contents handling API
    // concat(options: Options = {}): this {
    //     const outFile = options.outFile || this.conf.outFile;
    //     if (!outFile) {
    //         const verbose = this.conf.verbose || options.verbose;
    //         if (verbose) info('[rtb:concat] Missing conf.outFile. No output generated.');
    //         return this;
    //     }
    //     return this.filter().pipe(requireSafe('gulp-concat')(outFile, options));
    // }

    // minifyCss(options: Options = {}): this {
    //     return this.filter().pipe(requireSafe('gulp-clean-css')(options)).rename({ extname: '.min.css' });
    // }

    // minifyJs(options: Options = {}): this {
    //     return this.filter().pipe(requireSafe('gulp-terser')(options)).rename({ extname: '.min.js' });
    // }
}
