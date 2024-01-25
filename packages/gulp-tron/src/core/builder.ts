/**
 *  Builder Base Class
 */

import gulp, { SrcMethod, DestMethod } from 'gulp'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import streamToPromise from 'stream-to-promise'
import * as del from 'del'
import { Options, arrayify, copy, cloneStream } from "../utils/utils.js"
import { TaskFunction } from 'gulp'
import { ReloaderOptions } from './reloader.js'
import is from '../utils/typecheck.js'
import { EventEmitter } from 'events'
import { SpawnOptions } from 'child_process'
import { ExternalCommand, exec } from '../utils/process.js'
import { msg } from '../utils/log.js'

export type GulpStream = ReturnType<SrcMethod>
export type Stream = GulpStream
export type GulpTaskFunction = TaskFunction
export type BuildFunction = (builder: GBuilder, conf: TaskOptions) => void | Promise<any>
export type CopyParam = { src: string | string[], dest: string }
// export type RTBExtension = (...args: any[]) => BuildFunction;

//--- BuilderType
export type BuildName = string
export type BuildNameSelector = string | string[] | RegExp | RegExp[]; export type BuilderClassName = string
export type BuilderType = BuilderClassName | BuildFunction | ExternalCommand | GBuilder | 'cleaner' | 'watcher'
export type BuilderClassType = typeof GBuilder

//--- BuildSet
export type BuildSet = BuildName | GulpTaskFunction | BuildItem | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = { set: BuildSet[] }
export function series(...args: BuildSet[]): BuildSetSeries { return args }
export function parallel(...args: BuildSet[]): BuildSetParallel { return { set: args } }

//--- BuildItem
export type BuildItem = BuildConfig | WatcherConfig | CleanerConfig
export type BuildItems = { [key: string]: BuildItem }

type SRC = Parameters<SrcMethod>


//--- BuildConfig
export interface BuildConfig {
    name: string                        // build name, mandatory field
    builder?: BuilderType               // main build operations in various form: function, object, class, etc
    src?: Parameters<SrcMethod>[0]      // source for build operation
    dest?: Parameters<DestMethod>[0]    // output(destination) directory of the build operation
    // order?: string[];                // input file(src) ordering
    outFile?: string                    // optional output file name
    preBuild?: BuildFunction            // function to be executed before BuildConfig.builder
    postBuild?: BuildFunction           // function to be executed after BuildConfig.builder
    buildOptions?: Options              // buildConfig instance specific custom options
    moduleOptions?: Options             // gulp module options
    dependencies?: BuildSet             // buildSet to be executed before this build task
    triggers?: BuildSet                 // buildSet to be executed after this build task
    watch?: string | string[]           // override default watch, 'src' if defined
    addWatch?: string | string[]        // additional watch in addition to watch or default watch
    clean?: string | string[]           // clean targets
    flushStream?: boolean               // finish all the output streams before exiting gulp task
    reloadOnChange?: boolean            // Reload on change when watcher is running. default is true.
    verbose?: boolean,                  // print verbose messages
    silent?: boolean,                   // depress informative messages
};

//--- WatcherConfig (Watcher task config)
export interface WatcherConfig extends Pick<BuildConfig, "watch"> {
    name?: string                  // optional buildName. if undefined, defaults to '@watch'
    builder: 'watcher',             // MUST be literal constant 'watcher'
    filter?: BuildNameSelector,     // filter for buildNames (inside the project) to be watched
    browserSync?: ReloaderOptions  // browserSync initializer options
    livereload?: ReloaderOptions   // livereload initializer options
}

//--- CleanerConfig (Cleaner task config)
export interface CleanerConfig extends Pick<BuildConfig, "clean">, CleanOptions {
    name?: string                  // optional buildName. if undefined, defaults to '@clean'
    builder: 'cleaner',             // MUST be literal constant 'cleaner'
    filter?: BuildNameSelector,     // filter for buildNames (inside the project) to be cleaned
}

export interface TaskOptions extends Omit<BuildConfig, 'name' | 'builder'> {
    buildOptions: Options
    moduleOptions: Options
    [key: string]: any
}

export interface CleanOptions extends del.Options {
    clean?: string | string[]
}


//--- internals
type PromiseExecutor = () => void | Promise<any>

// interface BuildConfigNorm extends BuildConfig {
//     buildOptions: Options;
//     moduleOptions: Options;
// }

// function toPromise(stream: Stream): Promise<Buffer> {
//     return streamToPromise(stream)
// }


//--- GBuilder
export class GBuilder extends EventEmitter {
    protected _name: string = ""
    protected _displayName: string = ""     // gulp task name
    protected _conf: TaskOptions = { name: '', buildOptions: {}, moduleOptions: {} };
    protected _stream: GulpStream = gulp.src('./initial-dummy/**/*.dummy')
    protected _streamQ: GulpStream[] = [];
    protected _promiseSync: Promise<any> = Promise.resolve();

    constructor() { super() }

    get className() { return this.constructor.name }
    get name() { return this._name }
    get displayName() { return this._displayName }
    get conf() { return this._conf }
    get buildOptions() { return this.conf.buildOptions }
    get moduleOptions() { return this.conf.moduleOptions }
    get stream() { return this._stream }
    get buildProcess() { return this.__buildProcess }
    set buildFunction(func: BuildFunction) { this._build = func }
    set displayName(name) { this._displayName = name }

    static isBuildItem(item: any): boolean {
        return item.hasOwnProperty('name') && is.String(item.name)
            || item.hasOwnProperty('buildName') && is.String(item.buildName)
    }

    /**----------------------------------------------------------------
     * Build sequence functions: Return value should be void or Promise
     *-----------------------------------------------------------------*/
    //: gulp task entry point
    protected async __buildProcess(): Promise<any> {
        this._start()
        await this._execute(this.conf.preBuild)
        await this._build(this, this.conf)
        await this._promiseSync
        // await Promise.all(this._promises)
        await this._execute(this.conf.postBuild)
        this._finish()
    }

    protected _execute(action?: BuildFunction): void | Promise<any> {
        if (is.Function(action)) return action(this, this._conf)

        // if wrong argument, warn the user
        if (action) throw Error(`[RTB:${this.name}] BuildFunction type error. Check preBuid or postBuild props in BuildConfig.`)
    }

    protected _build(builder: GBuilder, conf: TaskOptions): void | Promise<any> {
        if (conf.verbose) console.log(`${builder.className} instance task=${builder.name} execution completed.`)
    }

    protected _start(): void {
        // this._syncMode = false;
        // if (this._syncMode)
        // console.log('RTB: Strating build in sync Mode.');
    }

    protected _finish() {
        this._stream = gulp.src('./initial-dummy/**/*.dummy')
        this._streamQ = []
    }


    //--- internal functions to be used by friend classes: GBuildManager
    __create(conf: BuildConfig): this {
        Object.assign(this._conf, conf)
        this._name = conf.name
        // this.moduleOptions = Object.assign({}, GBuildManager.defaultModuleOptions, conf.moduleOptions);
        return this
    }


    /**----------------------------------------------------------------
     * Build API: Returns value should be 'this'
     *----------------------------------------------------------------*/
    setBuildOptions(opts: Options) { Object.assign(this.conf.buildOptions, opts) }

    setModuleOptions(mopts: Options) { Object.assign(this.conf.moduleOptions, mopts) }

    src(...args: Parameters<SrcMethod>): this {
        const globs = args[0] || this._conf.src
        if (!globs) return this

        const opt = { ...this.moduleOptions.gulp?.src, ...args[1] }
        if (this.buildOptions.sourceMap) opt.sourcemaps = this.buildOptions.sourcemaps

        this._stream = gulp.src(globs, opt)
        return this
    }

    dest(...args: Parameters<DestMethod>): this {
        const folder = args[0] || this.conf.dest || '.'
        const opt = { ...this.moduleOptions.gulp?.dest, ...args[1] }
        if (this.buildOptions.sourceMap) opt.sourcemaps = this.buildOptions.sourcemaps
        return this.pipe(gulp.dest(folder, opt))
    }

    pipe(...args: Parameters<ReturnType<SrcMethod>['pipe']>): this {
        this._stream = this._stream.pipe(...args) as GulpStream
        return this
    }

    chain(action: BuildFunction): this {
        return this.promise(action(this, this._conf))
    }


    //--- accept function or promise
    promise(promise?: Promise<any> | void | PromiseExecutor): this {
        if (promise instanceof Promise)
            this._promiseSync = this._promiseSync.then(() => promise)
        else if (is.Function(promise)) {
            this._promiseSync = this._promiseSync.then(promise as PromiseExecutor)
        }
        return this
    }

    pushStream(): this {
        this._streamQ.push(this._stream)
        this._stream = this._stream.pipe(cloneStream())
        return this
    }

    popStream(): this {
        if (this._streamQ.length > 0) {
            if (this._stream) this.promise(streamToPromise(this._stream))  // promise for flushing
            const stream = this._streamQ.pop()
            if (stream) this._stream = stream
        }
        return this
    }

    debug(...args: Parameters<typeof debug>): this {
        this._stream = this._stream.pipe(debug(...args))
        return this
    }

    filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"], options: filter.Options = {}): this {
        return this.pipe(filter(pattern, options))
    }

    rename(options: Options = {}): this {
        return this.pipe(rename(options))
    }

    copy(param?: CopyParam | CopyParam[], options: Options = {}): this {
        if (!param) return this   // allow null argument

        const verbose = this.conf.verbose || options.verbose
        const _copy = (target: any): void => {
            let copyInfo = `[${target.src}] => ${target.dest}`
            if (verbose) msg(`[${this.name}]:copying: ${copyInfo}`)
            copy(target.src, target.dest)
            // .then(() => { if (verbose) msg(`[${this.name}]:copying: ${copyInfo} --> done`) })
        }
        arrayify(param).forEach(target => _copy(target))
        return this
    }

    del(patterns: string | string[], options: Options = {}): this {
        let silent = this.conf.silent || options.silent
        if (!silent) msg('Deleting:', patterns)
        del.deleteSync(patterns, options)
        return this
    }

    exec(cmd: string | ExternalCommand, args: string[] = [], options: SpawnOptions = {}): this {
        return this.promise(() => exec(cmd, args, options))
    }

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
