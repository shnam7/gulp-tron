import gulp from 'gulp'
import { BuildStream } from './buildSream.js'
import type { BuildFunction, BuildSet, BuildSetParallel, BuildSetSeries, CleanerConfig, CleanerOptions, GulpTaskFunction, TaskConfig, TaskOptions, WatcherConfig, WatcherOptions } from './types.js'
import is from '../utils/is.js'
import arrayify from '../utils/arrayify.js'
import browserSync from 'browser-sync'

//--- test if wrapped by gulp.serial() or gulp.parallel()
// const isGulpSeriesOrParallelTask = (t: any): boolean => /(series|parallel)/.test(t.toString())

type TaskConfigWithMutableTaskName = Omit<TaskConfig, 'taskName'> & {
    -readonly [key in keyof Pick<TaskConfig, 'taskName'>]: TaskConfig[key]
}

//--- GBuildManager
export class Tron {
    protected _gulp = gulp
    protected _taskConfigs: TaskConfig[]
    protected static annonCount = 0

    constructor() {
        this._taskConfigs = []
    }

    get gulp() { return this._gulp }
    set gulp(gulpInst: typeof gulp) { this._gulp = gulpInst }
    get taskConfigs() { return this._taskConfigs }

    /**
     * Create a gulp task with TaskConfig object
     * @param conf TaskConfig object
     */

    /**
     *
     * @param name Task name (mandatory field)
     * @param build build function. if not specified, then defual null function is assigned internally.
     * @param opts TaskConfig object for additional task options
     */
    task(name: string, build: BuildFunction, opts?: TaskOptions): this
    task(conf: TaskConfig, options?: TaskOptions): this

    // overloading implementation for task() function
    task(arg1: TaskConfig | string, arg2?: BuildFunction | TaskOptions, opts: TaskOptions = {}): this {
        let conf: TaskConfig
        if (is.String(arg1)) {
            if (!is.Function(arg2)) throw Error(`Tron:task:${arg1}:second argument should be BuildFunction.`)
            conf = { name: arg1, build: arg2, ...opts }
        }
        else {
            if (!arg2) arg2 = {}
            conf = { ...arg1, ...arg2 as TaskOptions }
        }

        const gulpTask = this.resolveBuildSet(conf)
        if (!gulpTask) throw Error(`Tron:task: failed to create task "${conf.name}"`)
        return this
    }

    /**
     * Alias for calling task() or createTasks() with single TaskConfig object
     */
    createTask(conf: TaskConfig, options: TaskOptions = {}): this {
        return this.task(conf, options)
    }

    /**
     * Create multiple tasks sequencially
     *
     * Usage:
     *  tron.task(taskConfig)
     *  tron.task([taskConfig,...], taskOptions)
     *  tron.task(taskConfig1, taskConfig2, ..., taskConfigN, taskOptions) --> recommend form
     *  tron.task(taskConfig1, (taskOptions or Task taskConfig)...)
     *  tron.task([taskConfig,...], (taskOptions or Task taskConfig)...)
     *
     * Note: options parameter is optional, and recommended to be the last argument.
     *  If multiple options are passed in, then their properties are all assigned from right to left, resulting in single options argument.
     *  All the tasks will be configured with this resulting single options argument.
     *
     * @param tasks array of TaskConfig objects. usage: tron.task([task1, task2], options)
     * @param options task options
     */
    createTasks(task: TaskConfig, options?: TaskOptions): this
    createTasks(tasks: TaskConfig[], options?: TaskOptions): this
    createTasks(task: TaskConfig, ...args: (TaskConfig | TaskOptions)[]): this

    /**
     * Overloading to allow this form: createTasks(...tasks: TaskConfig[], options: TaskConfig): GulpTaskFunction | GulpTaskFunction[];
     *
     *
     * @param args
     * @returns
     */
    createTasks(task: TaskConfig | TaskConfig[], ...args: (TaskConfig | TaskOptions)[]): this {
        const { length, [length - 1]: last } = args
        if (length == 0) return this

        let tasks: TaskConfig[] = arrayify(task)
        let opts: TaskOptions = {}
        if (is.Array(args[0])) {
            tasks = args.slice(0, -1) as TaskConfig[]
            opts = last as TaskConfig
        }
        else args.forEach(arg => {
            if (arg.hasOwnProperty('name'))
                tasks.push(arg as TaskConfig)
            else
                opts = { ...opts, ...arg as TaskOptions }
        })

        tasks.forEach(task => this.task(task, opts))
        return this
    }

    /**
     * Create gulp task cleaning the output from the build and anything specified in the options.
     * @param name cleaner task name.
     */
    addCleaner(conf?: CleanerConfig): this

    addCleaner(nameOrConfig?: string | CleanerConfig, options: CleanerOptions = {}): this {
        const conf: CleanerConfig = is.String(nameOrConfig) ? { name: nameOrConfig, ...options } : nameOrConfig as CleanerConfig || {}
        const target = conf.target || this._taskConfigs   // defaults to all tasks

        let cleanList: string[] = arrayify(target).reduce(
            (accum, task) => accum.concat(arrayify(task.clean)),
            [] as string[])
        if (conf.clean) cleanList = cleanList.concat(arrayify(conf.clean))

        const __cleanerFunction__: BuildFunction = (bs: BuildStream) => {
            bs.clean(cleanList)
        }
        this.task({ name: conf.name || '@clean', build: __cleanerFunction__ })
        return this
    }

    addWatcher(conf?: WatcherConfig): this
    addWatcher(nameOrConfig?: string | WatcherConfig, options: WatcherOptions = {}): this {
        const config: WatcherConfig = is.String(nameOrConfig) ? { name: nameOrConfig, ...options } : nameOrConfig as WatcherConfig || {}
        const target = arrayify(config.target || this._taskConfigs)   // defaults to all tasks
        const taskName = config.name || '@watch'
        let isWatching = false

        const __watcherFunction__: BuildFunction = (bs: BuildStream) => {
            if (isWatching) return  // watch task should not run repeatedly on change detection.

            function _handleChangeEvent(watcher: ReturnType<typeof gulp.watch>, logLevel?: string) {
                if (config.browserSync) watcher.on('change', browserSync.reload)
                watcher.on('change', (path: string) => {
                    if (logLevel === 'verbose') {
                        let msg = `change detected:'${path}`
                        if (config.browserSync) msg += ' reloaded.'
                        bs.log(msg)
                    }
                })
            }

            if (config.browserSync) browserSync.init(config.browserSync || {})
            target.forEach(conf => {
                const watched: string[] = arrayify(conf.watch || conf.src).concat(arrayify(conf.addWatch))
                if (watched.length > 0) {
                    bs.log(`Watching '${conf.taskName}':[${watched}]`)
                    _handleChangeEvent(gulp.watch(watched, gulp.task(conf.taskName || '')), conf.logLevel)
                }
            })
            isWatching = true
        }
        this.task({ ...config, name: taskName, build: __watcherFunction__ })
        return this
    }

    /**
     * Convert the series of buildSet items into buildSet series object
     *
     * @param args list of BuildSet items
     * @returns BuildSetSeries object of the buildSet list
     */
    series(...args: BuildSet[]): BuildSetSeries { return args }

    /**
     * Convert the series of buildSet items into buildSet parallel object
     *
     * @param args list of BuildSet items
     * @returns BuildSetParallel object of the buildSet list
     */
    parallel(...args: BuildSet[]): BuildSetParallel { return { set: args } }

    /**
     * Convert build name to gulp task name.
     *
     * @param name TaskConfig.name or TaskConfig.taskName
     * @returns TaskConfig.taskName (gulp task name)
     */
    taskName(name: string): string | undefined {
        const taskConfig = this.findTask(name)
        return taskConfig ? taskConfig.taskName : undefined
    }

    /**
     * Create gulp task with the data in TaskConfig object.
     *
     * @param conf TaskConfig object
     * @returns task funtion created by gulp. Value returned from gulp.task(taskName).
     */
    resolveTaskConfg(conf: TaskConfigWithMutableTaskName): GulpTaskFunction {
        const { name, build, dependsOn, triggers, logLevel, group } = conf
        if (!name) throw Error(`Tron:resolveTaskConfig: invalid task name: ${name}`)
        if (
            (name === '@clean' && conf.build?.name !== '__cleanerFunction__') ||
            (name === '@watch' && conf.build?.name !== '__watcherFunction__')
        ) {
            throw Error(`Tron:resolveTaskConfig:invalid task name:'${name}' is a reserved task name.`)
        }

        const prefix = (conf.prefix === true) ? group : (conf.prefix === false) ? undefined : conf.prefix
        let taskName = (prefix) ? `${prefix}:${name}` : name

        if (gulp.task(taskName) && logLevel === 'verbose')
            console.log(`Tron:resolveBuildSet:gulp task ${taskName} already exists. skipping...`)

        let gulpTask = gulp.task(taskName)
        if (gulpTask) return gulpTask.unwrap()

        const main: GulpTaskFunction = async (done) => {
            if (build) {
                const bs = new BuildStream(taskName, conf)
                const ret = await build(bs)
                if (ret instanceof Promise) await ret
                return bs.flushStream()
            }
            done()
        }
        main.displayName = `${taskName}:main`

        // sanity check: taskName must be unique.
        if (this.findTask(taskName)) throw Error(`Tron:resolveTaskConfig:taskName ${taskName} already registerd.`)

        let tasks: GulpTaskFunction[] = []
        let deps = this.resolveBuildSet(dependsOn)
        let trigs = this.resolveBuildSet(triggers)

        if (deps) tasks.push(deps)
        // create mainTask if no deps and no trigs, to make this task(taskName) created and exist.
        if (build || (!deps && !trigs)) {
            // if (tasks.length === 1 && (deps || trigs)) mainTask.displayName = `${taskName}:main`
            tasks.push(main)
        }
        if (trigs) tasks.push(trigs)

        // now tasks would have at least 1 entry
        if (tasks.length > 1)
            gulp.task(taskName, gulp.series(...tasks))
        else {
            gulp.task(taskName, tasks[0] as GulpTaskFunction)

            // if (tasks[0] === main || isGulpSeriesOrParallelTask(tasks[0]))
            //     gulp.task(taskName, tasks[0] as GulpTaskFunction)
            // else
            //     gulp.task(taskName, gulp.series(tasks[0] as GulpTaskFunction))
        }

        gulpTask = gulp.task(taskName)
        if (!gulpTask) throw Error(`Tron:resolveBuildSet:unexpected failure in creating gulp task ${taskName}.`)

        // gulp task successfully created.
        conf.taskName = taskName
        this._taskConfigs.push(conf)
        return gulpTask.unwrap()
    }

    /**
     *Convert buildSet to gulp task tree
    *
    * @param buildSet buildSet currently being resolved
    * @param conf original TaskConfig
    * @returns gulp task function of the gulp task tree constructed from buildSet. undefined there's no task.
    */
    resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | undefined {
        if (!buildSet) return

        // buildSet is gulp task name (BuildName)
        if (is.String(buildSet)) {
            const gulpTask = gulp.task(buildSet)
            if (!gulpTask) throw Error(`Tron:resolveBuildset: Task "${buildSet}" is not found.`)
            return gulpTask
        }

        if (is.Function(buildSet)) {
            // all the function argument to the function is assumed to be BuildFunction,
            // and it is converted to TaskCobfig object for processing with __resolveBuildSet()
            const name = `tron-anonymous#${++Tron.annonCount}-${buildSet.name}`
            return this.resolveTaskConfg({ name, build: buildSet })
        }

        // buildSet is TaskConfig object
        if (is.Object(buildSet) && buildSet.hasOwnProperty('name'))
            return this.resolveTaskConfg(buildSet as TaskConfig)

        // buildSet is series of BuildSet items
        if (is.Array(buildSet)) {
            // strip redundant outer arrays
            while (buildSet.length === 1 && is.Array(buildSet[0])) buildSet = buildSet[0]

            let list = []
            for (let bs of buildSet) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.series(list) : list[0]
        }

        // buildSet is parallel set of BuildSet items
        if (is.Object(buildSet) && buildSet.hasOwnProperty('set')) {
            let set: BuildSet[] = (buildSet as BuildSetParallel).set
            // strip redundant outer arrays
            while (set.length === 1 && Array.isArray(set[0])) set = set[0]

            let list = []
            for (let bs of set) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.parallel(list) : list[0]
        }

        // buildSet is unknown - throw Error
        throw Error(`Tron:resolveBuildSet:Unknown type of buildSet: ${buildSet}`)
    }

    selectTasksByGroup(groups?: string | string[] | RegExp | RegExp[]): TaskConfig[] {
        return this._taskConfigs.filter(task => arrayify(groups).some(g => task.name.match(g)))
    }

    selectTasks(filter: string | string[] | RegExp | RegExp[]): TaskConfig[] {
        return this.filterTasks(this._taskConfigs, filter)
    }

    selectTasksAll(): TaskConfig[] {
        return this._taskConfigs
    }

    filterTasks(tasks: TaskConfig[], filter?: string | string[] | RegExp | RegExp[]): TaskConfig[] {
        if (!filter) return tasks
        return tasks.filter(task => arrayify(filter).some(f => task.name.match(f) || task.taskName?.match(f)))
    }

    /**
     * Find gulp task with name. Returns GulpTaskFunction if found, or undefined.
     *
     * @param name task name looking for. It can be build name or task name prefixed with group name.
     */
    findTask(name?: string): TaskConfig | undefined {
        if (!name) return undefined

        const tasks = this.selectTasks(`^${name}$`)

        if (tasks.length > 1) throw Error('Tron:findTask:Internal error. duplicat task name.')
        return (tasks.length === 1) ? tasks[0] : undefined
    }
}
