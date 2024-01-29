import gulp from 'gulp'
import { BuildStream } from './buildSream.js'
import type { BuildFunction, BuildSet, BuildSetParallel, BuildSetSeries, CleanerConfig, CleanerOptions, GulpTaskFunction, TaskConfig, TaskOptions } from './types.js'
import is from '../utils/is.js'
import arrayify from '../utils/arrayify.js'

//--- test if wrapped by gulp.serial() or gulp.parallel()
// const isGulpSeriesOrParallelTask = (t: any): boolean => /(series|parallel)/.test(t.toString())


//--- GBuildManager
export class Tron {
    protected _taskConfigs: TaskConfig[]
    protected static annonCount = 0

    constructor() {
        this._taskConfigs = []
    }

    get taskConfigs() { return this._taskConfigs }

    /**
     * Create a gulp task with TaskConfig object
     * @param conf TaskConfig object
     */
    task(conf: TaskConfig, options?: TaskOptions): this

    /**
     *
     * @param name Task name (mandatory field)
     * @param build build function. if not specified, then defual null function is assigned internally.
     * @param opts TaskConfig object for additional task options
     */
    task(name: string, build: BuildFunction, opts?: TaskOptions): this

    // overloading implementation for task() function
    task(arg1: TaskConfig | string, arg2?: BuildFunction | TaskOptions, opts: TaskOptions = {}): this {
        const conf: TaskConfig = is.String(arg1)
            ? { name: arg1, build: arg2 as BuildFunction, ...opts }
            : { ...arg1, ...arg2 as TaskOptions }

        const gulpTask = this.resolveBuildSet(conf)
        if (!gulpTask) throw Error(`Tron:task: failed to create task "${conf.name}"`)
        return this
    }

    /**
     * Alias for calling task() or createTasks() with single TaskConfig object
     */
    createTask(conf: TaskConfig, options: TaskOptions = {}): this {
        return this.createTasks(conf, options)
    }

    /**
     * Create multiple tasks sequencially
     *
     * @param tasks array of TaskConfig objects. usage: tron.task([task1, task2], options)
     * @param options task options
     */
    createTasks(task: TaskConfig, options?: TaskOptions): this
    createTasks(tasks: TaskConfig[], options?: TaskOptions): this

    /**
     * Overloading to allow this form: createTasks(...tasks: TaskConfig[], options: TaskConfig): GulpTaskFunction | GulpTaskFunction[];
     *
     * Usage: tron.task(task1, task2), tron.task(task1, task2, options)
     *
     * Note: options parameter is optional, but should come as the last argument if needed.
     *
     * @param args
     * @returns
     */
    createTasks(...args: any[]): this {
        let tasks: TaskConfig[] = args
        let options: TaskOptions = {}

        if (is.Array(args[0])) {
            tasks = args[0] as TaskConfig[]
            if (args.length >= 2 && args[1]) options = args[1]
        }
        else {
            const { length, [length - 1]: last } = args
            if (length == 0) return this
            if (!last.hasOwnProperty('name')) {
                tasks = tasks.slice(0, -1)
                options = last
            }
        }
        arrayify(tasks).forEach(task => {
            task = Object.assign(task, options)
            this.task(task as TaskConfig)
        })
        return this

        // let gulpTasks = arrayify(tasks).reduce((list, task) => {
        //     task = Object.assign(task, options)
        //     list.push(this.task(task as TaskConfig))
        //     return list
        // }, [] as GulpTaskFunction[])
        // return  (gulpTasks.length > 1) ? gulpTasks : gulpTasks[0] as GulpTaskFunction
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
            bs.del(cleanList)
        }
        this.task({ name: conf.name || '@clean', build: __cleanerFunction__ })
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
    resolveTaskConfg(conf: TaskConfig): GulpTaskFunction {
        const { name, build, dependsOn, triggers, logLevel, group } = conf
        if (!name) throw Error(`Tron:resolveTaskConfig: invalid task name: ${name}`)
        if ((name === '@clean' || name === '@watch') && conf.build?.name !== '__cleanerFunction__')
            throw Error(`Tron:resolveTaskConfig:invalid task name:'${name}' is a reserved task name.`)

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
                return bs.flush()
            }
            done()
        }
        main.displayName = `${taskName}:main`

        // sanity check: taskName must be unique.
        if (this.findTask(taskName)) throw Error('Tron:resolveTaskConfig:taskName ${taskName} already registerd.')

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

    filterTasks(tasks: TaskConfig[], filter?: string | string[] | RegExp | RegExp[]): TaskConfig[] {
        if (!filter) return tasks
        return tasks.filter(task => arrayify(filter).some(f => task.name.match(f) || task.taskName?.match(f)))
    }

    /**
     * Find gulp task with name. Returns GulpTaskFunction if found, or undefined.
     *
     * @param name task name looking for. It can be build name or task name prefixed with group name.
     */
    findTask(name: string): TaskConfig | undefined {
        const tasks = this.selectTasks(`^${name}$`)

        if (tasks.length > 1) throw Error('Tron:findTask:Internal error. duplicat task name.')
        return (tasks.length === 1) ? tasks[0] : undefined
    }
}
