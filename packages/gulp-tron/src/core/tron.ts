import gulp from 'gulp'
import { BuildStream, BuildStreamOptions } from './buildSream.js'
import type { BuildSet, BuildSetParallel, BuildSetSeries, GulpTaskFunction, GulpTaskFunctionCallback, TaskConfig, TaskGroupOptions, TaskOptions } from './types.js'
import is from '../utils/is.js'

export interface BuildOptions {
    [key: string]: any
}

export type BuildFunction = (bs: BuildStream, opts?: BuildOptions) => void | Promise<any>


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
    task(conf: TaskConfig, options?: TaskOptions): GulpTaskFunction

    /**
     *
     * @param name Task name (mandatory field)
     * @param build build function. if not specified, then defual null function is assigned internally.
     * @param opts TaskConfig object for additional task options
     */
    task(name: string, build?: BuildFunction, opts?: TaskOptions): GulpTaskFunction

    // overloading implementation for task() function
    task(arg1: TaskConfig | string, arg2?: BuildFunction | TaskOptions, opts: TaskOptions = {}): GulpTaskFunction {
        const conf: TaskConfig = is.String(arg1)
            ? { name: arg1, build: arg2 as BuildFunction, ...opts }
            : { ...arg1, ...arg2 as TaskOptions }

        const gulpTask = this.resolveBuildSet(conf)
        if (!gulpTask) throw Error(`Tron:task: failed to create task "${conf.name}"`)
        return gulpTask
    }

    /**
     * Create multiple tasks sequencially
     *
     * @param tasks list of TaskConfig objects
     * @returns
     */
    // createTasks(...tasks: TaskConfig[], options: TaskGroupOptions = {}): GulpTaskFunction | GulpTaskFunction[] {
    createTasks(...tasks: (TaskConfig | TaskOptions)[]): GulpTaskFunction | GulpTaskFunction[] {
        let { length, [length - 1]: options } = tasks
        if (!options) options = {}
        if (!options.hasOwnProperty('name')) tasks.pop()

        let gulpTasks = tasks.reduce((list, task) => {
            if (task.hasOwnProperty('name')) {
                task = Object.assign(task, options)
                list.push(this.task(task as TaskConfig))
            }
            return list
        }, [] as GulpTaskFunction[])

        return (gulpTasks.length > 1) ? gulpTasks : gulpTasks[0] as GulpTaskFunction
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
     * Convert buildSet to gulp task tree
     *
     * @param buildSet buildSet currently being resolved
     * @param conf original TaskConfig
     * @returns gulp task function of the gulp task tree constructed from buildSet. undefined there's no task.
     */
    resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | undefined {
        if (!buildSet) return

        // buildSet is gulp task name (BuildName)
        if (typeof buildSet === 'string') {
            const gulpTask = gulp.task(buildSet)
            if (!gulpTask) throw Error(`resolveBuildset: Task "${buildSet}" is not found.`)
            return gulpTask
        }

        //--- test if wrapped by gulp.serial() or gulp.parallel()
        const isWrapped = (str?: string): boolean => !!str && new RegExp(`(series|parallel)`).test(str)

        // buildSet is gulp task function
        if (typeof buildSet === 'function') {
            const name = `tron-anonymous#${++Tron.annonCount}-${buildSet.name}`
            return this.resolveBuildSet({ name, build: <unknown>buildSet as BuildFunction })
        }

        // buildSet is series set
        if (Array.isArray(buildSet)) {
            // strip redundant arrays
            while (buildSet.length === 1 && Array.isArray(buildSet[0])) buildSet = buildSet[0]

            let list = []
            for (let bs of buildSet) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.series(list) : list[0]
        }

        // buildSet is parallel set
        if (typeof buildSet === 'object' && buildSet.hasOwnProperty('set')) {
            let set = (<BuildSetParallel>buildSet).set
            while (set.length === 1 && Array.isArray(set[0])) set = set[0]

            let list = []
            for (let bs of set) {
                let ret = this.resolveBuildSet(bs)
                if (ret) list.push(ret)
            }
            if (list.length === 0) return
            return list.length > 1 ? gulp.parallel(list) : list[0]
        }

        // buildSet is TaskConfig object
        if (typeof buildSet === 'object') {
            const tc = buildSet as TaskConfig
            const name = (tc.group && tc.groupPrefix) ? tc.group + ':' + tc.name : tc.name
            if (!name) throw Error(`resolveBuildSet: invalid task name: ${name}`)

            const gulpTask = gulp.task(name)
            if (gulpTask) {
                // duplicated buil1d name may not be error in case it was resolved multiple time due to deps or triggers
                // So, info message is displayed only when verbose mode is turned on.
                // However, it's recommended to avoid it by using buildNames in deppendencies and triggers field of BuildConfig
                if (tc.logLevel == 'verbose') console.log(`resolveBuildSet:taskName=${name} already registered.`)
                return gulpTask
            }

            let tasks: GulpTaskFunction[] = []
            let deps = this.resolveBuildSet(tc.dependsOn)
            let trigs = this.resolveBuildSet(tc.triggers)
            if (deps) tasks.push(deps)
            if (tc.build || (!deps && !trigs)) {
                // create mainTask if no deps and no triges, regardless of build property value
                const mainTask = async () => {
                    if (!tc.build) return Promise.resolve()
                    const bs = new BuildStream(name)
                    await tc.build(bs)
                    return bs.flush()
                }
                mainTask.displayName = (tc.build && !deps && !trigs) ? name : name + ':main'
                tasks.push(mainTask)
            }
            if (trigs) tasks.push(trigs)

            if (tasks.length === 1) {
                let gulpTaskFunc = tasks[0] as GulpTaskFunction
                if (gulpTaskFunc.name != 'mainTask' && !isWrapped(gulpTaskFunc.name)) gulpTaskFunc = gulp.series(gulpTaskFunc)
                gulp.task(name, gulpTaskFunc)
            }
            else
                gulp.task(name, gulp.series(...tasks))

            tc.name = name
            this._taskConfigs.push(buildSet as TaskConfig)
            return gulp.task(name)
        }

        // buildSet is unknow - throw Error
        throw Error(`resolveBuildSet:Unknown type of buildSet: ${buildSet}`)
    }
}
