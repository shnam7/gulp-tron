import { gulp, useGulp } from './globals.js'
import { BuildStream } from './buildSream.js'
import { is, arrayify } from '../utils/index.js'
import type {
    BuildFunction,
    BuildSet,
    BuildSetParallel,
    BuildSetSeries,
    CleanerOptions,
    GulpTaskFunction,
    TaskConfig,
    TaskOptions,
    TaskSelector,
    WatcherOptions
} from './types.js'
import browserSync from 'browser-sync'

//--- test if wrapped by gulp.serial() or gulp.parallel()
// const isGulpSeriesOrParallelTask = (t: any): boolean => /(series|parallel)/.test(t.toString())

type TaskConfigWithMutableTaskName = Omit<TaskConfig, 'taskName'> & {
    -readonly [key in keyof Pick<TaskConfig, 'taskName'>]: TaskConfig[key]
}

/**
 * Convert series of buildSet items into buildSet Series object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetSeries object of the buildSet list.
 */
export function series(...args: BuildSet[]): BuildSetSeries { return args }

/**
 * Convert series of buildSet items into buildSet Parallel object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetParallel object of the buildSet list.
 */
export function parallel(...args: BuildSet[]): BuildSetParallel { return { set: args } }


//--- GBuildManager
export class Tron {
    protected _taskConfigs: TaskConfig[]
    protected _watchTaskNames: string[]

    /** Counter to assigne ID to annonymous tasks */
    protected static annonCount = 0

    constructor() {
        this._taskConfigs = []
        this._watchTaskNames = []
    }

    /**
     * Set gulp instance to use.
     * Use this function to make sure the gulp instance you want is actuall running
     *
     * @param gulpInstance
     */
    use(gulpInstance: typeof gulp) {
        useGulp(gulpInstance)
    }

    // get taskConfigs() { return this._taskConfigs }

    /**
     * Create a gulp task with TaskConfig
     *
     * @param conf TaskConfig
     * @returns this
     */
    task(conf: TaskConfig): this

    /**
     * Create a gulp task
     *
     * @param name Task name (mandatory field).
     * @param build build function. if not specified, default null function is assigned internally.
     * @param opts TaskConfig object for additional task options
     * @returns this
     */
    task(name: string, buildFunc: BuildFunction, opts?: TaskOptions): this

    /**
     * Implementation of task() overloading functions
     *
     * @param nameOrConfig taskName or TaskConfig.
     * @param buildFunc BuildFunction
     * @param opts TaskOptions
     * @returns this
     */
    task(nameOrConfig: TaskConfig | string, buildFunc?: BuildFunction, opts: TaskOptions = {}): this {
        let conf: TaskConfig
        if (is.String(nameOrConfig)) {
            conf = { name: nameOrConfig, build: buildFunc, ...opts }
        }
        else {
            conf = { ...nameOrConfig }
        }

        const gulpTask = this._resolveBuildSet(conf)
        if (!gulpTask) throw Error(`Tron:task: failed to create task "${conf.name}"`)
        return this
    }

    /**
     * Alias for task(conf: TaskConfig) or createTasks() with single TaskConfig object.
     *
     * @param conf TaskConfig
     * @returns this
     */
    createTask(conf: TaskConfig): this {
        return this.task(conf)
    }

    /**
     * Create multiple tasks sequencially.
     *
     * @param confList List of TaskConfig objects.
     * @returns this
     */
    createTasks(...confList: (TaskConfig | TaskOptions)[]): this {
        let taskOptions: Omit<TaskOptions, 'name'> = {}
        confList = confList.filter(conf => {
            if (!conf.hasOwnProperty('name')) {
                taskOptions = { ...taskOptions, ...conf }
                return false
            }
            return true
        })

        arrayify(confList).forEach((conf) => {
            const taskConf: TaskConfig = { ...conf as TaskConfig, ...taskOptions }
            this.task(taskConf)
        })
        return this
    }

    /**
     * Create a task cleaning the output from the build and anything specified in the options.
     *
     * @param options cleaner task options.
     */
    addCleaner(options: CleanerOptions = {}): this {
        const target = this.selectTasks(options.target) || this._taskConfigs

        let cleanList: string[] = target.reduce(
            (accum, task) => accum.concat(arrayify(task.clean)),
            [] as string[]
        )
        if (options.clean) cleanList = cleanList.concat(arrayify(options.clean))

        const __cleanerFunction__: BuildFunction = (bs: BuildStream) => {
            bs.clean(cleanList)
        }
        this.task({ name: '@clean', ...options, build: __cleanerFunction__ })
        return this
    }

    /**
     * Create task watching tasks.
     *
     * @param options WatchOptions
     * @returns
     */
    addWatcher(options: WatcherOptions = {}): this {
        let target = this.selectTasks(options.target) || this._taskConfigs
        let taskName = options.name || '@watch'

        let isWatching = false
        const __watcherFunction__: BuildFunction = (bs: BuildStream) => {

            // watch task should not run repeatedly on change detection.
            if (isWatching) return

            function _handleChangeEvent(watcher: ReturnType<typeof gulp.watch>, logLevel?: string) {
                if (options.browserSync) watcher.on('change', browserSync.reload)
                watcher.on('change', (path: string) => {
                    if (logLevel !== 'silent') {
                        let msg = `change detected:'${path}`
                        if (options.browserSync) msg += ' reloaded.'
                        bs.log(msg)
                    }
                })
            }

            if (options.browserSync) browserSync.init(options.browserSync || {})
            target.forEach(task => {
                // skip the other watchers (watcher should not monitor the other wacthers)
                if (task.build === __watcherFunction__) return

                const watched: string[] = arrayify(task.watch || task.src).concat(arrayify(task.addWatch))
                if (watched.length > 0) {
                    bs.log(`Watching '${task.taskName}':[${watched}]`)
                    _handleChangeEvent(gulp.watch(watched, gulp.task(task.taskName || '')), task.logLevel)
                }
            })
            isWatching = true
        }

        this.task({ ...options, name: taskName, build: __watcherFunction__ })
        this._watchTaskNames.push(taskName)
        return this
    }

    /**
     * Convert the series of buildSet items into buildSet series object
     *
     * @param args list of BuildSet items
     * @returns BuildSetSeries object of the buildSet list
     */
    series(...args: BuildSet[]): BuildSetSeries { return series(...args) }

    /**
     * Convert the series of buildSet items into buildSet parallel object
     *
     * @param args list of BuildSet items
     * @returns BuildSetParallel object of the buildSet list
     */
    parallel(...args: BuildSet[]): BuildSetParallel { return parallel(...args) }

    /**
     * Convert TaskCoinfig name to gulp task name.
     *
     * @param name TaskConfig.name or TaskConfig.taskName
     * @returns TaskConfig.taskName (gulp task name)
     */
    taskName(name: string): string | undefined {
        const taskConfig = this.findTask(name)
        return taskConfig ? taskConfig.taskName : undefined
    }

    selectTasks(filter?: TaskSelector): TaskConfig[] | undefined {
        if (!filter) return undefined

        const selected = this._taskConfigs.filter(task => arrayify(filter).some(f => {
            if (is.String(f)) return task.name === f || task.taskName === f
            return task.name.match(f) || task.taskName?.match(f)
        }))

        return selected.length > 0 ? selected : undefined
    }

    selectTasksAll(): TaskConfig[] {
        return this._taskConfigs
    }

    /**
     * Find TaskConfig with the name.
     *
     * @param name task name looking for. It can be build name or task name prefixed with group name.
     * @returns TaskFConfig object found, or undefined.
     */
    findTask(name?: string): TaskConfig | undefined {
        if (!name) return undefined

        const tasks = this.selectTasks(`^${name}$`)
        if (!tasks) return undefined

        if (tasks.length > 1) throw Error('Tron:findTask:Internal error. duplicat task name.')
        return tasks[0]
    }

    /**
     * Select TaskConfigs with the group name.
     *
     * @param groups group name.
     * @returns List of TaskConfigs with the group name.
     */
    selectTasksByGroup(groups?: TaskSelector): TaskConfig[] | undefined {
        const selected = this._taskConfigs.filter(task => arrayify(groups).some(g => task.name.match(g)))
        return selected.length > 0 ? selected : undefined
    }

    /**
     * Create gulp task with the data in TaskConfig object.
     *
     * @param conf TaskConfig object
     * @returns task funtion created by gulp. Value returned from gulp.task(taskName).
     */
    _resolveTaskConfg(conf: TaskConfigWithMutableTaskName): GulpTaskFunction {
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

        const main: GulpTaskFunction = (done) => {
            if (build) {
                const bs = new BuildStream(taskName, conf)
                const ret = build(bs)
                const promise = (ret instanceof Promise) ? ret : Promise.resolve()

                return Promise.all([promise, bs.promiseSync]).then(async () => bs.stream)
            }
            done()
        }
        main.displayName = `${taskName}:main`

        // sanity check: taskName must be unique.
        if (this.findTask(taskName)) throw Error(`Tron:resolveTaskConfig:taskName ${taskName} already registerd.`)

        let tasks: GulpTaskFunction[] = []
        let deps = this._resolveBuildSet(dependsOn)
        let trigs = this._resolveBuildSet(triggers)

        if (deps) tasks.push(deps)
        // create mainTask if no deps and no trigs, to make this task(taskName) created and exist.
        if (build || (!deps && !trigs)) {
            // if (tasks.length === 1 && (deps || trigs)) mainTask.displayName = `${taskName}:main`
            tasks.push(main)
        }
        if (trigs) tasks.push(trigs)

        // now tasks would have at least 1 entry
        if (tasks.length > 1) {
            gulp.task(taskName, gulp.series(...tasks))
        }
        else {
            gulp.task(taskName, tasks[0]!)
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
    _resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | undefined {
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
            return this._resolveTaskConfg({ name, build: buildSet })
        }

        // buildSet is TaskConfig object
        if (is.Object(buildSet) && buildSet.hasOwnProperty('name'))
            return this._resolveTaskConfg(buildSet as TaskConfig)

        // buildSet is series of BuildSet items
        if (is.Array(buildSet)) {
            // strip redundant outer arrays
            while (buildSet.length === 1 && is.Array(buildSet[0])) buildSet = buildSet[0]

            let list = []
            for (let bs of buildSet) {
                let ret = this._resolveBuildSet(bs)
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
                let ret = this._resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.parallel(list) : list[0]
        }

        // buildSet is unknown - throw Error
        throw Error(`Tron:resolveBuildSet:Unknown type of buildSet: ${buildSet}`)
    }
}
