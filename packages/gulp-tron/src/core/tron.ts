import browserSync from 'browser-sync'
import multimatch from 'multimatch'
import {is, arrayify} from '../utils/index.js'
import {gulp, useGulp} from './globals.js'
import {BuildStream} from './build-stream.js'
import type {
    BuildFunction,
    BuildSet,
    BuildSetParallel,
    BuildSetSeries,
    CleanerOptions,
    GulpTaskFunction,
    TaskConfig,
    BuildOptions,
    WatcherOptions,
} from './types.js'

// --- test if wrapped by gulp.serial() or gulp.parallel()
// const isGulpSeriesOrParallelTask = (t: any): boolean => /(series|parallel)/.test(t.toString())

// type TaskConfigWithMutableTaskName = Omit<TaskConfig, 'taskName'> & {
//     -readonly [key in keyof Pick<TaskConfig, 'taskName'>]: TaskConfig[key]
// }

/**
 * Convert series of buildSet items into buildSet Series object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetSeries object of the buildSet list.
 */
export function series(...args: BuildSet[]): BuildSetSeries {
    return args
}

/**
 * Convert series of buildSet items into buildSet Parallel object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetParallel object of the buildSet list.
 */
export function parallel(...args: BuildSet[]): BuildSetParallel {
    return {set: args}
}

// --- GBuildManager
export class Tron {
    /** Counter to assigne ID to annonymous tasks */
    protected static annonCount = 0

    protected _taskConfigs: TaskConfig[]
    protected _watchTaskNames: string[]

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

    // Get taskConfigs() { return this._taskConfigs }

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
    task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions): this

    /**
     * Implementation of task() overloading functions
     *
     * @param nameOrConfig taskName or TaskConfig.
     * @param buildFunc BuildFunction
     * @param opts TaskOptions
     * @returns this
     */
    task(
        nameOrConfig: TaskConfig | string,
        buildFunc?: BuildFunction,
        opts: BuildOptions = {},
    ): this {
        const conf = is.String(nameOrConfig)
            ? {name: nameOrConfig, build: buildFunc, ...opts}
            : {...nameOrConfig}

        const gulpTask = this._resolveBuildSet(conf)
        if (!gulpTask) throw new Error(`Tron:task: failed to create task "${conf.name}"`)
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
    createTasks(...confList: Array<TaskConfig | BuildOptions>): this {
        let taskOptions: Omit<BuildOptions, 'name'> = {}
        confList = confList.filter(conf => {
            if (!Object.hasOwn(conf, 'name')) {
                taskOptions = {...taskOptions, ...conf}
                return false
            }

            return true
        })

        for (const conf of arrayify(confList)) {
            const taskConf: TaskConfig = {...(conf as TaskConfig), ...taskOptions}
            this.task(taskConf)
        }

        return this
    }

    /**
     * Create a task cleaning the output from the build and anything specified in the options.
     *
     * @param options cleaner task options.
     */
    addCleaner(options: CleanerOptions = {}): this {
        const target = this.selectTasks(options.target) ?? this._taskConfigs

        // Let cleanList: string[] = []
        // for (const task of target) {
        //     cleanList = [...cleanList, ...arrayify(task.clean)]
        // }

        const cleanList = [
            ...target.flatMap(task => arrayify(task.clean)),
            ...arrayify(options.clean),
        ]

        // If (options.clean) cleanList = [...cleanList, ...arrayify(options.clean)]

        // eslint-disable-next-line @typescript-eslint/naming-convention
        function __cleanerFunction__(bs: BuildStream) {
            bs.clean(cleanList)
        }

        this.task({name: '@clean', ...options, build: __cleanerFunction__})
        return this
    }

    /**
     * Create task watching tasks.
     *
     * @param options WatchOptions
     * @returns
     */
    addWatcher(options: WatcherOptions = {}): this {
        const target = this.selectTasks(options.target) ?? this._taskConfigs
        const taskName = options.name ?? '@watch'

        let isWatching = false
        // eslint-disable-next-line @typescript-eslint/naming-convention
        function __watcherFunction__(bs: BuildStream) {
            // Watch task should not run repeatedly on change detection.
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
            for (const task of target) {
                // Skip the other watchers (watcher should not monitor the other wacthers)
                if (task.build === __watcherFunction__) continue

                const watched: string[] = [
                    ...arrayify(task.watch ?? task.src),
                    ...arrayify(task.addWatch),
                ]

                if (watched.length > 0) {
                    // bs.log(`Watching '${task.taskName}':[${watched.join(' ')}]`)
                    bs.log(`Watching '${task.name}':[${watched.join(', ')}]`)
                    _handleChangeEvent(
                        // gulp.watch(watched, gulp.task(task.taskName ?? '')),
                        gulp.watch(watched, gulp.task(task.name ?? '')),
                        task.logLevel,
                    )
                }
            }

            isWatching = true
        }

        this.task({...options, name: taskName, build: __watcherFunction__})
        this._watchTaskNames.push(taskName)
        return this
    }

    /**
     * Convert the series of buildSet items into buildSet series object
     *
     * @param args list of BuildSet items
     * @returns BuildSetSeries object of the buildSet list
     */
    series(...args: BuildSet[]): BuildSetSeries {
        return series(...args)
    }

    /**
     * Convert the series of buildSet items into buildSet parallel object
     *
     * @param args list of BuildSet items
     * @returns BuildSetParallel object of the buildSet list
     */
    parallel(...args: BuildSet[]): BuildSetParallel {
        return parallel(...args)
    }

    // /**
    //  * Convert TaskCoinfig name to gulp task name.
    //  *
    //  * @param name TaskConfig.name or TaskConfig.taskName
    //  * @returns TaskConfig.taskName (gulp task name)
    //  */
    // taskName(name: string): string | undefined {
    //     const taskConfig = this.findTask(name)
    //     return taskConfig ? taskConfig.taskName : undefined
    // }

    /**
     * Get TaskConfigs from Tron task registry.
     *
     * @param patterns Task name selector pattern.
     * Refer to 'multimatch' for patterns (https://github.com/sindresorhus/multimatch)
     *
     * @returns Array of TaskConfig's selected. undefined if no task found.
     */
    selectTasks(patterns?: string | string[]): TaskConfig[] | undefined {
        if (!patterns) return undefined
        patterns = arrayify(patterns)
        if (patterns.length > 0 && patterns.every(pattern => pattern.startsWith('!')))
            patterns.unshift('*')

        const selected = this._taskConfigs.filter(
            task => multimatch(task.name, patterns).length > 0,
        )

        return selected.length > 0 ? selected : undefined
    }

    selectTasksAll(): TaskConfig[] {
        return this._taskConfigs
    }

    /**
     * Find TaskConfig with the name.
     *
     * @param name task name to look for.
     * @returns TaskFConfig object found, or undefined.
     */
    findTask(name?: string): TaskConfig | undefined {
        for (const t of this._taskConfigs) if (t.name === name) return t

        return undefined
    }

    // /**
    //  * Select TaskConfigs with the group name.
    //  *
    //  * @param groups group name.
    //  * @returns List of TaskConfigs with the group name.
    //  */
    // selectTasksByGroup(groups?: TaskSelector): TaskConfig[] | undefined {
    //     const selected = this._taskConfigs.filter(task =>
    //         arrayify(groups).some(g => task.name.match(g)),
    //     )
    //     return selected.length > 0 ? selected : undefined
    // }

    /**
     *Convert buildSet to gulp task tree
     *
     * @param buildSet buildSet currently being resolved
     * @param conf original TaskConfig
     * @returns gulp task function of the gulp task tree constructed from buildSet. undefined there's no task.
     */
    protected _resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | undefined {
        if (!buildSet) return

        // buildSet is gulp task name (BuildName)
        if (is.String(buildSet)) {
            const gulpTask = gulp.task(buildSet)
            if (!gulpTask) throw new Error(`Tron:resolveBuildset: Task "${buildSet}" is not found.`)
            return gulpTask
        }

        if (is.Function(buildSet)) {
            // All the function argument to the function is assumed to be BuildFunction,
            // and it is converted to TaskCobfig object for processing with __resolveBuildSet()
            const name = `tron-anonymous#${++Tron.annonCount}-${buildSet.name}`
            return this._resolveTaskConfg({name, build: buildSet})
        }

        // buildSet is TaskConfig object
        if (is.Object(buildSet))
            return Object.hasOwn(buildSet, 'set')
                ? this._resolveBuildSetGroup(buildSet as BuildSetSeries | BuildSetParallel)
                : this._resolveTaskConfg(buildSet as TaskConfig)

        // buildSet is BuildSetSeries or BuildSetParallel
        return this._resolveBuildSetGroup(buildSet as BuildSetParallel | BuildSetSeries)
    }

    protected _resolveBuildSetGroup(
        buildSet: BuildSetSeries | BuildSetParallel,
    ): GulpTaskFunction | undefined {
        // BuildSet is series of BuildSet items
        if (is.Array(buildSet)) {
            // Strip redundant outer arrays
            while (buildSet.length === 1 && is.Array(buildSet[0])) buildSet = buildSet[0]

            const list = []
            for (const bs of buildSet) {
                const ret = this._resolveBuildSet(bs)
                if (ret) list.push(ret)
            }

            if (list.length === 0) return
            return list.length > 1 ? gulp.series(list) : list[0]
        }

        // BuildSet is parallel set of BuildSet items
        if (is.Object(buildSet) && Object.hasOwn(buildSet, 'set')) {
            let {set} = buildSet
            // Strip redundant outer arrays
            while (set.length === 1 && Array.isArray(set[0])) set = set[0]

            const list = []
            for (const bs of set) {
                const ret = this._resolveBuildSet(bs)
                if (ret) list.push(ret)
            }

            if (list.length === 0) return
            return list.length > 1 ? gulp.parallel(list) : list[0]
        }

        // BuildSet is unknown - throw Error
        throw new Error(`Tron:resolveBuildSet:Unknown type of buildSet`, {cause: buildSet})
    }

    /**
     * Create gulp task with the data in TaskConfig object.
     *
     * @param conf TaskConfig object
     * @returns task funtion created by gulp. Value returned from gulp.task(taskName).
     */
    // _resolveTaskConfg(conf: TaskConfigWithMutableTaskName): GulpTaskFunction {
    protected _resolveTaskConfg(conf: TaskConfig): GulpTaskFunction {
        // const {name, build, dependsOn, triggers, logLevel, group} = conf
        const {name, build, dependsOn, triggers, logLevel} = conf
        if (!name) throw new Error(`Tron:resolveTaskConfig: invalid task name: ${name}`)
        if (
            (name === '@clean' && conf.build?.name !== '__cleanerFunction__') ||
            (name === '@watch' && conf.build?.name !== '__watcherFunction__')
        ) {
            throw new Error(
                `Tron:resolveTaskConfig:invalid task name:'${name}' is a reserved task name.`,
            )
        }

        // const prefix =
        //     conf.prefix === true ? group : conf.prefix === false ? undefined : conf.prefix
        // const taskName = prefix ? `${prefix}${name}` : name
        const taskName = name

        if (gulp.task(taskName) && logLevel === 'verbose')
            console.log(`Tron:resolveBuildSet:gulp task ${taskName} already exists. skipping...`)

        let gulpTask = gulp.task(taskName)
        if (gulpTask) return gulpTask.unwrap()

        const main: GulpTaskFunction = async done => {
            if (build) {
                const bs = new BuildStream(taskName, conf)
                return bs._main(build)
            }

            done()
        }

        main.displayName = `${taskName}:main`

        // Sanity check: taskName must be unique.
        if (this.findTask(taskName))
            throw new Error(`Tron:resolveTaskConfig:taskName ${taskName} already registerd.`)

        const tasks: GulpTaskFunction[] = []
        const deps = this._resolveBuildSet(dependsOn)
        const trigs = this._resolveBuildSet(triggers)

        if (deps) tasks.push(deps)
        // Create mainTask if no deps and no trigs, to make this task(taskName) created and exist.
        if (build ?? (!deps && !trigs)) {
            // If (tasks.length === 1 && (deps || trigs)) mainTask.displayName = `${taskName}:main`
            tasks.push(main)
        }

        if (trigs) tasks.push(trigs)

        // Now tasks would have at least 1 entry
        if (tasks.length > 1) {
            gulp.task(taskName, gulp.series(...tasks))
        } else {
            gulp.task(taskName, tasks[0]!)
        }

        // This always return valid task Function because taskName proved not exist in task registry
        // at the start: if (gulp.task(taskName) && logLevel === 'verbose') ...
        gulpTask = gulp.task(taskName)!
        // if (!gulpTask)
        //     throw new Error(
        //         `Tron:resolveBuildSet:unexpected failure in creating gulp task ${taskName}.`,
        //     )

        // Gulp task successfully created.
        // conf.taskName = taskName
        this._taskConfigs.push(conf)
        return gulpTask.unwrap()
    }
}
