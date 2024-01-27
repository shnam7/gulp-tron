/**
 *  Builder Base Class
 */

import gulp, { DestMethod, SrcMethod } from 'gulp'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import streamToPromise from 'stream-to-promise'
import child_process from 'child_process'
import { CopyOptions, CopyParam, copy, copyBatch } from '../utils/copy.js'
import { DelOptions, del } from '../utils/del.js'
import type { ExecOptions, GulpStream, PluginFunction, TaskOptions } from './types.js'
import is from '../utils/is.js'

export type BuildStreamOptions = Omit<TaskOptions, 'build' | 'dependOn' | 'triggers'>

//--- GBuilder
export class BuildStream {
    protected _name: string
    protected _stream: GulpStream = gulp.src('./initial-dummy/**/*.dummy')
    protected _promiseSync: Promise<any> = Promise.resolve();
    protected _opts: BuildStreamOptions

    constructor(name: string, opts: BuildStreamOptions = {}) {
        this._name = name
        this._opts = { ...opts }
    }

    get name() { return this._name }
    get className() { return this.constructor.name }
    get stream() { return this._stream }
    get opts() { return this._opts }

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

    copy(patterns: string | string[], destPath: string, opts: CopyOptions): this

    copy(param?: CopyParam | CopyParam[], opts?: CopyOptions): this

    copy(arg1?: string | string[] | CopyParam | CopyParam[], arg2?: string | CopyOptions, arg3: CopyOptions = {}): this {
        if (typeof arg1 === 'string' || Array.isArray(arg1) && typeof arg1[0] === 'string')
            copy(arg1 as string | string[], arg2 as string, { logLevel: this._opts.logLevel, ...arg3 })
        else
            copyBatch(arg1 as CopyParam | CopyParam[], { logLevel: this._opts.logLevel, ...arg2 as CopyOptions })
        return this
    }

    del(patterns: string | string[], opts: DelOptions = {}): this {
        del(patterns, opts)
        return this
    }

    exec(command: string, options: ExecOptions): this {
        if (this.opts.logLevel === 'verbose') console.log(`Executing command: '${command}'`)
        child_process.execSync(command, options)
        if (this.opts.logLevel === 'verbose') console.log(`Executing command: '${command}' finished.`)
        return this
    }
}
