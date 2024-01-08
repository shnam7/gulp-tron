/**
 *  GReloader - Browser reloader
 */
import browserSync from 'browser-sync'
import { msg, Options } from "../utils/utils.js"

export interface ReloaderOptions extends Options {}

export class GReloader {
    protected _module: any
    protected _options: Options = {};

    constructor(options?: ReloaderOptions) { Object.assign(this._options, options) }

    activate() {}
    stream(opts: Options = {}) {}
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

    stream(opts: Options) {
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

    stream(opts: Options) {
        if (this._module) return this._module.stream(opts)
    }
}
