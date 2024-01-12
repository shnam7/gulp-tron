import gulp, { TaskFunctionCallback } from 'gulp'
import { arrayify, } from "../utils/utils.js"
import { GTron } from './tron.js'
import { GReloader, GBrowserSync, GLiveReload } from './reloader.js'
import is from '../utils/typecheck.js'
import { BuildConfig, BuildFunction, BuildItem, BuildItems, BuildName, BuildNameSelector, BuildSet, BuildSetParallel, CleanerConfig, GBuilder, GulpTaskFunction, TaskOptions, WatcherConfig } from './builder.js'
import { ExternalCommand, exec } from '../utils/process.js'
import { info, msg } from '../utils/log.js'

export type ProjectOptions = {
    projectName?: string       // optional
    prefix?: string
    customBuilderDirs?: string | string[]
}

export class GProject {
    protected _options: ProjectOptions = { prefix: "" };
    protected _builders: GBuilder[] = [];
    protected _reloaders: GReloader[] = [];
    protected _vars: any = {};

    constructor(builditems: BuildItem | BuildItems = {}, options: ProjectOptions = {}) {
        Object.assign(this._options, options)
        this.addBuildItems(builditems)
    }

    addBuildItem(buildItem: BuildItem): this {
        if (buildItem.builder === 'watcher') return this.addWatcher(buildItem as WatcherConfig)
        if (buildItem.builder === 'cleaner') return this.addCleaner(buildItem as CleanerConfig)

        this.resolveBuildSet(buildItem)
        return this
    }

    addBuildItems(items: BuildItem | BuildItems): this {
        // detect if items is single buildItem
        if (GBuilder.isBuildItem(items)) return this.addBuildItem(items as BuildItem)
        Object.entries(items as BuildItems).forEach(([key, conf]) => this.addBuildItem(conf))
        return this
    }

    addWatcher(config: string | WatcherConfig = { builder: 'watcher' }): this {
        const opts: WatcherConfig = is.String(config) ? { name: config, builder: 'watcher' } : Object.assign({}, config)

        if (opts.browserSync) this._reloaders.push(new GBrowserSync(opts.browserSync))
        if (opts.livereload) this._reloaders.push(new GLiveReload(opts.livereload))

        // create watch build item
        return this.addBuildItem({
            name: opts.name || '@watch',
            builder: (watcher: GBuilder) => {
                // watch build items
                this._builders.forEach(builderInstance => {
                    if (opts.filter) {
                        let skip = true
                        arrayify(opts.filter).forEach(filter => { if (builderInstance.name.match(filter)) { skip = false; return } })
                        if (skip) return
                    }

                    this._reloaders.forEach(reloader => builderInstance.on('reload', (builderInstance: GBuilder, type: string, path: string, stats) => {
                        // console.log(`[${rtb.name}:reload]: stream=${!!rtb.stream} type=${type}, path=${path}, stats=${stats}`);
                        if (builderInstance.stream)
                            builderInstance.pipe(reloader.module(opts))
                        else
                            reloader.reload(type == 'change' ? path : undefined)
                    }))

                    let watched = arrayify(builderInstance.conf.watch ? builderInstance.conf.watch : builderInstance.conf.src).concat(arrayify(builderInstance.conf.addWatch))
                    if (watched.length <= 0 || builderInstance.name.length === 0) return
                    msg(`Watching ${builderInstance.name}: [${watched}]`)
                    let gulpWatcher = gulp.watch(watched, gulp.parallel(builderInstance.name))

                    // transfer gulp watch events to rtb
                    if (builderInstance.conf.reloadOnChange !== false)
                        gulpWatcher.on('all', (...args: any[]) => builderInstance.once('finish', () => builderInstance.emit('reload', builderInstance, ...args)))
                })

                // pure watch target
                const watched = arrayify(opts.watch)
                if (watched.length > 0) {
                    msg(`Watching ${watcher.name}: [${watched}]`)
                    let gulpWatcher = gulp.watch(watched, (done: any) => done())

                    if (watcher.conf.reloadOnChange != false) {
                        gulpWatcher.on('all', (path: string) => {
                            this._reloaders.forEach(reloader => reloader.reload(path))
                        })
                    }
                }

                // activate reloaders
                this._reloaders.forEach(reloader => reloader.activate())
            }
        })
    }

    addCleaner(config: string | CleanerConfig = { builder: 'cleaner' }): this {
        const opts: CleanerConfig = is.String(config) ? { name: config, builder: 'cleaner' } : Object.assign({}, config)

        return this.addBuildItem({
            name: opts.name || '@clean',
            builder: (builder: GBuilder) => {
                let cleanList = arrayify(opts.clean)
                this._builders.forEach(builder => {
                    if (opts.filter) {
                        let skip = true
                        arrayify(opts.filter).forEach(filter => { if (builder.name.match(filter)) skip = false })
                        if (skip) return
                    }

                    if (builder.conf.clean) cleanList = cleanList.concat(arrayify(builder.conf.clean))
                })

                msg(`[${builder.conf.name}]: cleaning `, cleanList)
                builder.del(cleanList, { silent: true })
            }
        })
    }

    addVars(vars: { [key: string]: any }): this {
        Object.assign(this._vars, vars)
        return this
    }

    getBuildNames(selector: BuildNameSelector): string[] {
        let ret: string[] = []
        const ar = arrayify(selector)
        this._builders.forEach((builderInstance: GBuilder) => ar.forEach(sel => {
            if (builderInstance.name.match(sel)) ret.push(builderInstance.name)
        }))
        return ret
    }


    //--- accesors

    get projectName() { return this._options.projectName || "" }

    get builders() { return this._builders }

    get prefix() { return this._options.prefix }

    get vars() { return this._vars }


    //--- internals

    protected resolveBuildSet(buildSet?: BuildSet): BuildName | GulpTaskFunction | void {
        if (!buildSet) return

        // if buildSet is BuildName or GulpTaskFunction
        if (is.String(buildSet) || is.Function(buildSet))
            return buildSet as (BuildName | GulpTaskFunction)

        // if buildSet is BuildConfig
        if (GBuilder.isBuildItem(buildSet)) {
            let conf = buildSet as BuildConfig
            const displayName = this._options.prefix + conf.name

            // check for duplicate task registeration
            let gulpTask = gulp.task(displayName)
            if (gulpTask && (gulpTask.displayName === displayName)) {
                // duplicated build name may not be error in case it was resolved multiple time due to deps or triggers
                // So, info message is displayed only when verbose mode is turned on.
                // However, it's recommended to avoid it by using buildNames in deppendencies and triggers field of BuildConfig
                if (conf.verbose) info(`GProject:resolve: taskName=${displayName} already registered`)
                return displayName
            }

            const builderInstance = this.getBuilder(conf)
            const mainTask: GulpTaskFunction = (done: TaskFunctionCallback) => builderInstance.buildProcess().then(() => done())
            const deps = arrayify(conf.dependencies)
            const task = conf.builder ? mainTask : undefined
            const triggers = arrayify(conf.triggers)
            mainTask.displayName = displayName
            builderInstance.displayName = displayName

            // sanity check for the final task function before calling gulp.task()
            let resolved = this.resolveBuildSet([...deps, task, ...triggers] as BuildSet)
            if (!resolved)
                resolved = mainTask
            else if (is.String(resolved))
                resolved = gulp.parallel(resolved)

            builderInstance.__create(conf)
            gulp.task(displayName, <GulpTaskFunction>resolved)
            this._builders.push(builderInstance)
            return displayName
        }

        // if buildSet is BuildSetSeries: recursion
        else if (is.Array(buildSet)) {
            // strip redundant arrays
            while (buildSet.length === 1 && is.Array(buildSet[0])) buildSet = buildSet[0]

            let list = []
            for (let bs of buildSet) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.series(list) : list[0]
        }

        // if buildSet is BuildSetParallel: recursion
        else if (is.Object(buildSet) && buildSet.hasOwnProperty('set')) {
            // strip redundant arrays
            let set = (<BuildSetParallel>buildSet).set
            while (set.length === 1 && is.Array(set[0])) set = set[0]

            let list = []
            for (let bs of set) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.parallel(list) : list[0]
        }

        // info('GProject:resolve:buildSet='); dmsg(buildSet);
        throw Error('GProject:resolve:Unknown type of buildSet')
    }

    protected getBuilder(conf: BuildConfig): GBuilder {
        let builder = conf.builder

        // if builderInstance is GBuilder instance
        if (builder instanceof GBuilder) return builder

        // if builderInstance is GBuilderClassName
        if (is.String(builder)) return GTron.createBuilderInstance(builder)

        // if builderInstance is BuildFunction
        if (is.Function(builder)) {
            const builderInstance = GTron.createBuilderInstance()
            const { name, builder, taskOptions }: TaskOptions = { buildOptions: {}, moduleOptions: {}, ...conf }
            builderInstance.buildFunction = builder as BuildFunction
            return builderInstance
        }

        // if builderInstance is ExternalBuilder
        if (is.Object(builder) && builder!.hasOwnProperty('command')) {
            const builderInstance = GTron.createBuilderInstance()
            const { name, builder, taskOptions }: TaskOptions = { buildOptions: {}, moduleOptions: {}, ...conf }
            builderInstance.buildFunction = async () => exec(<ExternalCommand>builder)
            return builderInstance
        }

        // if builderInstance is not specified
        if (!builder) {
            msg(`BuildName:${conf.name}: No builderInstance specified.`)
            return GTron.createBuilderInstance()
        }
        throw Error(`[name:${this._options.prefix + conf.name}]Unknown ObjectBuilder.`)
    }
}
