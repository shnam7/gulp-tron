import browserSync from 'browser-sync'
import multimatch from 'multimatch'
import {isArray, isString, isObject, isFunction} from '@wicle/is'
import arrayify from './utils/arrayify.js'
import {gulp} from './globals.js'
import {BuildStream} from './build-stream.js'
import {
    type BuildFunction,
    type BuildSet,
    type BuildSetParallel,
    type BuildSetSeries,
    type CleanerOptions,
    type GulpTaskFunction,
    type TaskConfig,
    type BuildOptions,
    type WatcherOptions,
    isValidTaskName,
    isTaskConfig,
    type GulpTaskName,
    type TaskBlock,
} from './types.js'

/**
 * Convert series of buildSet items into buildSet Series object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetSeries object of the buildSet list.
 */
export const series = (...args: BuildSet[]): BuildSetSeries => args

/**
 * Convert series of buildSet items into buildSet Parallel object.
 *
 * @param args list of BuildSet items.
 * @returns BuildSetParallel object of the buildSet list.
 */
export const parallel = (...args: BuildSet[]): BuildSetParallel => ({set: args})

/**
 * Main Tron class for managing gulp build tasks with modern TypeScript features.
 * Provides a fluent API for creating and managing build tasks.
 */
export class Tron {
    /** Counter to assign ID to anonymous tasks */
    protected static annonCount = 0

    // protected readonly _taskConfigs: TaskConfig[]
    readonly #taskBlocks: Map<GulpTaskName, TaskBlock>
    // readonly #watchTaskNames: string[]

    get taskCount(): number {
        return this.#taskBlocks.size
    }

    constructor() {
        // this._taskConfigs = []
        this.#taskBlocks = new Map<string, TaskBlock>()
        // this.#watchTaskNames = []
    }

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
     * @param build build function. if not specified, default null function is assigned.
     * @param opts Build options
     * @returns this
     */
    task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions): this

    /**
     * Implementation of task() overloading functions with improved error handling.
     *
     * @param nameOrConfig taskName or TaskConfig.
     * @param buildFunc BuildFunction
     * @param options BuildOptions
     * @returns this for method chaining
     */
    task(
        nameOrConfig: TaskConfig | GulpTaskName,
        buildFunc?: BuildFunction,
        options: BuildOptions = {},
    ): this {
        const conf: TaskConfig = isTaskConfig(nameOrConfig)
            ? {...nameOrConfig, ...options}
            : {name: nameOrConfig, build: buildFunc, ...options}

        if (!conf.name || !isValidTaskName(conf.name))
            throw new Error(`Tron:task: invalid task name: ${conf.name}`)

        if (!this._resolveTaskConfig(conf))
            throw new Error(`Tron:task: failed to create task "${conf.name}"`)

        return this
    }

    /**
     * Create multiple tasks in a given sequence with improved type safety.
     *
     * @param confList List of TaskConfig objects.
     * @returns this for method chaining
     */
    createTasks(...confList: TaskConfig[]): this {
        // Separate task configs from shared options
        const configs = confList.filter(conf => isTaskConfig(conf))

        // Process each valid task configuration
        for (const conf of configs) {
            this.task(conf)
        }

        return this
    }

    /**
     * Create a task cleaning all the clean targets(conf.clean) of the selected tasks,
     * and optional targets specified in options.clean.
     *
     * @param options cleaner task options with default values.
     * @returns this for method chaining
     */
    addCleaner(options: CleanerOptions = {}): this {
        const targetTaskNames = this.selectTasks(options.target ?? '*')
        const taskBlocks = targetTaskNames
            .map(name => this.findTask(name))
            .filter(task => task !== undefined)

        const cleanList = taskBlocks.flatMap(task => arrayify(task.clean))

        // Use arrow function with explicit name for better debugging
        const cleanerFunction = (bs: BuildStream): void => {
            bs.clean(cleanList)
        }

        // Set function name for better stack traces
        Object.defineProperty(cleanerFunction, 'name', {value: '__cleanerFunction__'})

        this.task({name: '@clean', ...options, build: cleanerFunction})
        return this
    }

    /**
     * Create watcher task, which watches files specified in `conf.watch` of the selected tasks.
     * Uses modern TypeScript features for better type safety and performance.
     *
     * @param options WatchOptions with default values
     * @returns this for method chaining
     */
    addWatcher(options: WatcherOptions = {}): this {
        const targetTaskName = this.selectTasks(options.target ?? '*')
        const taskBlocks = targetTaskName
            .map(name => this.findTask(name))
            .filter(task => task !== undefined)

        const taskName = options.name ?? '@watch'
        let isWatching = false

        // Use arrow function with better typing
        const watcherFunction = (bs: BuildStream): void => {
            // Watch task should not run repeatedly on change detection.
            if (isWatching) return

            // Helper function with improved typing
            const handleChangeEvent = (
                watcher: ReturnType<typeof gulp.watch>,
                logLevel?: string,
            ): void => {
                if (options.browserSync) {
                    watcher.on('change', browserSync.reload)
                }

                watcher.on('change', (path: string) => {
                    if (logLevel !== 'silent') {
                        const reloadMsg = options.browserSync ? ' reloaded.' : ''
                        bs.log(`change detected:'${path}${reloadMsg}`)
                    }
                })
            }

            // Initialize browser-sync if configured
            if (options.browserSync) {
                browserSync.init(options.browserSync)
            }

            // Set up watchers for each target task
            for (const task of taskBlocks) {
                // Skip the other watchers (watcher should not monitor the other watchers)
                if (task.build === watcherFunction) continue

                const watched = [...arrayify(task.watch ?? task.src), ...arrayify(task.addWatch)]

                if (watched.length > 0) {
                    bs.log(`Watching '${task.name}': [${watched.join(', ')}]`)
                    handleChangeEvent(
                        gulp.watch(watched, gulp.task(task.name ?? '')),
                        task.logLevel,
                    )
                }
            }

            isWatching = true
        }

        // Set function name for better debugging
        Object.defineProperty(watcherFunction, 'name', {value: '__watcherFunction__'})

        this.task({...options, name: taskName, build: watcherFunction})
        // this.#watchTaskNames.push(taskName)
        return this
    }

    /**
     * Convert the series of buildSet items into buildSet series object
     *
     * @param args list of BuildSet items
     * @returns BuildSetSeries object created from `args`.
     */
    series(...args: BuildSet[]): BuildSetSeries {
        return series(...args)
    }

    /**
     * Convert the series of buildSet items into buildSet parallel object
     *
     * @param args list of BuildSet items
     * @returns BuildSetParallel object created from `args`.
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
     * Select tasks with glob patterns using modern array methods.
     *
     * @param patterns Task name selector patterns.
     * Refer to 'multimatch' for patterns (https://github.com/sindresorhus/multimatch)
     *
     * @returns List of selected TaskConfig objects. Undefined if filter is undefined or no task found.
     */
    selectTasks(patterns?: string | string[]): GulpTaskName[] {
        const patternList = arrayify(patterns).filter(pattern => pattern.length > 0)
        if (patternList.length === 0) return []

        if (patternList.every(pattern => pattern.startsWith('!'))) patternList.unshift('*')

        const selected = this.#taskBlocks
            .keys()
            .toArray()
            .filter(taskName => multimatch(taskName, patternList).length > 0)

        return selected.length > 0 ? selected : []
    }

    /**
     * Get all the tasks registered using modern getter syntax.
     *
     * @returns Array of all the TaskConfig objects registered.
     */
    selectTasksAll(): readonly GulpTaskName[] {
        return this.#taskBlocks.keys().toArray()
    }

    /**
     * Find TaskConfig with a name using modern array method.
     *
     * @param name task name to look for.
     * @returns TaskConfig object if found. Or undefined.
     */
    findTask(name?: string): TaskBlock | undefined {
        return name ? this.#taskBlocks.get(name) : undefined
    }

    /**
     * Set gulp instance to use.
     * Use this function to make sure you are using the gulp instance you intent to use.
     *
     * @param gulpInstance gulp instance to use with tron.
     */
    // use(gulpInstance: typeof gulp) {
    //     useGulp(gulpInstance)
    // }

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
     * Convert buildSet to gulp task tree with improved type safety and error handling.
     *
     * @param buildSet buildSet currently being resolved
     * @returns gulp task function of the gulp task tree constructed from buildSet. undefined if there's no task.
     */
    protected _resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | undefined {
        if (!buildSet) return undefined

        // buildSet is gulp task name (BuildName)
        if (isString(buildSet)) {
            const taskName = buildSet as string
            const gulpTask = gulp.task(taskName)
            if (!gulpTask) {
                throw new Error(`Tron:resolveBuildSet: Task "${taskName}" is not found.`)
            }

            return gulpTask
        }

        if (isFunction(buildSet)) {
            // All function arguments are assumed to be BuildFunction,
            // and converted to TaskConfig object for processing
            const functionName = (buildSet as BuildFunction).name || 'buildFunc'
            const anonymousName = `tron-anonymous#${++Tron.annonCount}-${functionName}`
            return this._resolveTaskConfig({name: anonymousName, build: buildSet as BuildFunction})
        }

        // buildSet is TaskConfig object
        if (isObject(buildSet)) {
            return Object.hasOwn(buildSet as TaskConfig, 'set')
                ? this._resolveBuildSetGroup(buildSet as BuildSetSeries | BuildSetParallel)
                : this._resolveTaskConfig(buildSet as TaskConfig)
        }

        // buildSet is BuildSetSeries or BuildSetParallel
        return this._resolveBuildSetGroup(buildSet as BuildSetParallel | BuildSetSeries)
    }

    /**
     * Resolve a BuildSetGroup with enhanced type safety and modern array methods.
     *
     * @param buildSet BuildSetSeries or BuildSetParallel to resolve
     * @returns Gulp task function for the resolved group
     */
    protected _resolveBuildSetGroup(
        buildSet: BuildSetSeries | BuildSetParallel,
    ): GulpTaskFunction | undefined {
        // BuildSet is series of BuildSet items
        if (isArray(buildSet)) {
            // Strip redundant outer arrays using modern array methods
            let resolvedBuildSet = buildSet as BuildSet[]
            while (resolvedBuildSet.length === 1 && isArray(resolvedBuildSet[0])) {
                resolvedBuildSet = resolvedBuildSet[0] as BuildSetSeries
            }

            const tasks = resolvedBuildSet
                .map(bs => this._resolveBuildSet(bs))
                .filter((task): task is GulpTaskFunction => task !== undefined)

            if (tasks.length === 0) return undefined
            return tasks.length > 1 ? gulp.series(tasks) : tasks[0]
        }

        // BuildSet is parallel set of BuildSet items
        if (isObject(buildSet) && Object.hasOwn(buildSet, 'set')) {
            let {set} = buildSet as BuildSetParallel
            // Strip redundant outer arrays using modern array methods
            while (set.length === 1 && Array.isArray(set[0])) {
                set = set[0]
            }

            const tasks = set
                .map(bs => this._resolveBuildSet(bs))
                .filter((task): task is GulpTaskFunction => task !== undefined)

            if (tasks.length === 0) return undefined
            return tasks.length > 1 ? gulp.parallel(tasks) : tasks[0]
        }

        // BuildSet is unknown - throw Error with enhanced error message
        throw new Error(`Tron:resolveBuildSetGroup: Unknown type of buildSet`, {cause: buildSet})
    }

    /**
     * Create gulp task with the data in TaskConfig object using modern patterns.
     *
     * @param conf TaskConfig object
     * @returns task function created by gulp. Value returned from gulp.task(taskName).
     */
    protected _resolveTaskConfig(conf: TaskConfig): GulpTaskFunction {
        const {name, build, dependsOn, triggers, logLevel} = conf

        if (!name) throw new Error(`Tron:resolveTaskConfig: invalid task name: ${name}`)

        // Check for reserved task names with improved error messages
        const isReservedClean = name === '@clean' && conf.build?.name !== '__cleanerFunction__'
        const isReservedWatch = name === '@watch' && conf.build?.name !== '__watcherFunction__'

        if (isReservedClean || isReservedWatch) {
            throw new Error(
                `Tron:resolveTaskConfig: invalid task name: '${name}' is a reserved task name.`,
            )
        }

        const taskName = name

        // if (gulp.task(taskName) && logLevel === 'verbose')
        //     console.log(`Tron:resolveBuildSet: gulp task ${taskName} already exists. skipping...`)

        // let gulpTask = gulp.task(taskName)
        // if (gulpTask) return gulpTask.unwrap()

        // Create main task function with enhanced async handling
        const main: GulpTaskFunction = async done => {
            if (build) {
                const bs = new BuildStream(taskName, conf)
                return BuildStream.main(bs, build)
            }

            done()
        }

        main.displayName = `${taskName}:main`

        // Sanity check: taskName must be unique
        // if (this.findTask(taskName)) {
        //     throw new Error(`Tron:resolveTaskConfig: taskName ${taskName} already registered.`)
        // }

        const tasks: GulpTaskFunction[] = []
        const deps = this._resolveBuildSet(dependsOn)
        const trigs = this._resolveBuildSet(triggers)

        // Build task array using modern conditional logic
        if (deps) tasks.push(deps)

        // Create mainTask if build exists or if no deps and no trigs
        if (build ?? (!deps && !trigs)) {
            tasks.push(main)
        }

        if (trigs) tasks.push(trigs)

        // Create gulp task with modern spread operator and nullish coalescing
        if (tasks.length > 1) {
            gulp.task(taskName, gulp.series(...tasks))
        } else {
            gulp.task(taskName, tasks[0]!)
        }

        const taskBlock = {...conf} // make sure name not to be changed by options
        delete taskBlock.dependsOn
        delete taskBlock.triggers
        // Gulp task successfully created - store configuration
        this.#taskBlocks.set(conf.name, taskBlock)

        // This always returns valid task Function because taskName was proven not to exist
        return gulp.task(taskName)!.unwrap()
    }
}
