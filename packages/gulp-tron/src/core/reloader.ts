/**
 *  GReloader - Browser reloader
 */
import browserSync from 'browser-sync'
import { Options } from "../utils/utils.js"
import { msg } from '../utils/log.js'
import { GulpStream } from './builder.js'
import through2 from 'through2'

export interface ReloaderOptions extends Options {}

export class GReloader {
    protected _module: any
    protected _options: Options = {};

    constructor(options?: ReloaderOptions) { Object.assign(this._options, options) }

    activate() {}
    // module(opts: Options = {}): GulpStream { return through2.obj() }    // return pass-through
    module(opts: Options = {}): GulpStream { return this._module }    // return pass-through
    reload(path?: string | string[], opts: Options = {}) {
        if (!this._module) return  // if not activated, return
        this._module.reload(...(path ? [path, opts] : [opts]))
    }
}

export class GLiveReload extends GReloader {
    constructor(options: ReloaderOptions) {
        super(options)
    }

    activate() {
        // TODO: fix gulp-livereload impl.
        // if (this._module) return
        // this._module = requireSafe('gulp-livereload')
        // this._module.listen(this._options)
        // // console.log(this._options);
    }

    module(opts: Options) {
        if (this._module) return this._module(opts)
    }
}

export class GBrowserSync extends GReloader {
    constructor(moduleOptions: Options) {
        super(moduleOptions)
    }

    activate() {
        if (this._module) return
        this._module = browserSync.create(this._options.instanceName)
        this._module.init(this._options, () => msg('browserSync server started with options:', this._options))
    }

    module(opts: Options) {
        if (this._module) return this._module.stream(opts)
    }
}
