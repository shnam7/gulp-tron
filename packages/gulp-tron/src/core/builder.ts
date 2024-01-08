/**
 *  Builder Base Class
 */

import gulp, { SrcMethod } from 'gulp'
import debug from 'gulp-debug'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import streamToPromise from 'stream-to-promise'
import * as del from 'del'
import { Options, msg, ExternalCommand, arrayify, copy, exec, cloneStream } from "../utils/utils.js"
import { TaskFunction } from 'gulp'
import { ReloaderOptions } from './reloader.js'
import is from '../utils/typecheck.js'
import { EventEmitter } from 'events'
import { SpawnOptions } from 'child_process'

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

//--- BuildConfig
export interface BuildConfig {
    name: string                   // build name, mandatory field
    builder?: BuilderType          // main build operations in various form: function, object, class, etc
    src?: string | string[]        // source for build operation
    dest?: string                  // output(destination) directory of the build operation
    // order?: string[];               // input file(src) ordering
    outFile?: string               // optional output file name
    preBuild?: BuildFunction       // function to be executed before BuildConfig.builder
    postBuild?: BuildFunction      // function to be executed after BuildConfig.builder
    buildOptions?: Options         // buildConfig instance specific custom options
    moduleOptions?: Options        // gulp module options
    dependencies?: BuildSet        // buildSet to be executed before this build task
    triggers?: BuildSet            // buildSet to be executed after this build task
    watch?: string | string[]      // override default watch, 'src' if defined
    addWatch?: string | string[]   // additional watch in addition to watch or default watch
    clean?: string | string[]      // clean targets
    flushStream?: boolean          // finish all the output streams before exiting gulp task
    reloadOnChange?: boolean       // Reload on change when watcher is running. default is true.
    verbose?: boolean,              // print verbose messages
    silent?: boolean,               // depress informative messages
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

function toPromise(stream: Stream): Promise<Buffer> {
    return streamToPromise(stream)
}


//--- GBuilder
export class GBuilder extends EventEmitter {
    protected _name: string = ""
    protected _displayName: string = ""
    protected _conf: TaskOptions = { name: '', buildOptions: {}, moduleOptions: {} };
    protected _buildFunc: BuildFunction = (builder: GBuilder, conf: TaskOptions) => {}

    protected _stream: GulpStream = gulp.src('./initial-dummy/**/*.dummy')
    protected _streamQ: GulpStream[] = [];
    // protected _promises: Promise<any>[] = [];
    protected _promiseSync: Promise<any> = Promise.resolve();
    // protected _syncMode: boolean = false;

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
        this.emit('start', this, this._conf)
        this._start()
        this.emit('prebuild', this, this._conf)
        await this._execute(this.conf.preBuild)
        this.emit('build', this, this._conf)
        await this._build(this, this.conf)
        await this._promiseSync
        // await Promise.all(this._promises)
        this.emit('postbuild', this, this._conf)
        await this._execute(this.conf.postBuild)
        this.emit('finish', this, this._conf)
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
        this.emit('create', this, this._conf)
        return this
    }


    /**----------------------------------------------------------------
     * Build API: Returns value should be 'this'
     *----------------------------------------------------------------*/
    setBuildOptions(opts: Options) { Object.assign(this.conf.buildOptions, opts) }

    setModuleOptions(mopts: Options) { Object.assign(this.conf.moduleOptions, mopts) }

    src(src?: string | string[]): this {
        if (!src) src = this.conf.src
        if (!src) return this

        const mopts = this.moduleOptions

        this._stream = gulp.src(src, mopts.gulp?.src)

        // check input file ordering
        // if (this.conf.order && this.conf.order?.length > 0) {
        //     this.pipe(order(this.conf.order, mopts.order));
        // }
        this.emit('after-src', this)

        // check sourceMap option
        // if (this.buildOptions.sourceMap)
        //     this.pipe(requireSafe('gulp-sourcemaps').init(this.moduleOptions?.sourcemaps?.init));

        return this
    }

    dest(path?: string): this {
        this.emit('before-dest', this)

        // check sourceMap option
        if (this.buildOptions.sourceMap) {
            let opts = this.moduleOptions.sourcemaps || {}
            if (!opts.dest && opts.inline !== true) opts.dest = '.'
            //TODO: to be fixe later...
            this.pipe(gulp.dest(opts.dest, opts.write))
        }

        return this.pipe(gulp.dest(path || this.conf.dest || '.', this.moduleOptions.gulp?.dest))
    }

    pipe(destination: any, options?: { end?: boolean | undefined }): this {
        this._stream = this._stream.pipe(destination, options)
        return this
    }

    chain(action: BuildFunction): this {
        return this.promise(action(this, this._conf))
    }


    //--- accept function or promise
    promise(promise?: Promise<any> | void | PromiseExecutor, sync: boolean = false): this {
        if (promise instanceof Promise)
            this._promiseSync = this._promiseSync.then(() => promise)
        else if (is.Function(promise)) {
            this._promiseSync = this._promiseSync.then(promise as PromiseExecutor)
        }
        // if (promise instanceof Promise) {
        //     if (sync || this._syncMode)
        //         this._promiseSync = this._promiseSync.then(() => promise);
        //     else
        //         this._promises.push(promise);
        // }
        // else if (is.Function(promise)) {
        //     if (sync || this._syncMode)
        //         this._promiseSync = this._promiseSync.then(promise as PromiseExecutor);
        //     else {
        //         promise = (promise as PromiseExecutor)();
        //         if (promise) this._promises.push(promise);
        //     }
        // }
        return this
    }

    // sync(): this {
    //     this._syncMode = true;
    //     return this;
    // }

    // async(): this {
    //     this._syncMode = true;
    //     return this;
    // }

    // wait(msec: number = 0, sync: boolean = false): this {
    //     return (sync || this._syncMode)
    //         ? this.promise(() => wait(msec), sync)
    //         : this.promise(wait(msec), sync);
    // }

    pushStream(): this {
        this._streamQ.push(this._stream)
        this._stream = this._stream.pipe(cloneStream())
        return this
    }

    popStream(): this {
        if (this._streamQ.length > 0) {
            if (this._stream) this.promise(toPromise(this._stream))  // back for flushing
            const stream = this._streamQ.pop()
            if (stream) this._stream = stream
        }
        return this
    }

    debug(options: Options = {}): this {
        let opts = Object.assign({ title: options.title || '' }, options)
        return this.pipe(debug(opts))
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
        const _copy = (target: any): Promise<unknown> => {
            let copyInfo = `[${target.src}] => ${target.dest}`
            if (verbose) msg(`[${this.name}]:copying: ${copyInfo}`)
            return copy(target.src, target.dest)
                .then(() => { if (verbose) msg(`[${this.name}]:copying: ${copyInfo} --> done`) })
        }
        arrayify(param).forEach(target => this.promise(
            () => _copy(target)
            // (options.sync || this._syncMode) ? () => _copy(target) : _copy(target)
        ))
        return this
    }

    del(patterns: string | string[], options: Options = {}): this {
        let silent = this.conf.silent || options.silent
        if (!silent) msg('Deleting:', patterns)
        del.deleteSync(patterns, options)
        return this
        // if (options.sync || this._syncMode) {
        //     del.deleteSync(patterns, options)
        //     return this
        // }
        // return this.promise(del.deleteAsync(patterns, options), options.sync);
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
