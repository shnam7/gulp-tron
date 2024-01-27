import gulp from 'gulp'
import { BuildStream, BuildStreamOptions } from './buildSream.js'
import type { BuildSet, BuildSetParallel, BuildSetSeries, GulpTaskFunction, GulpTaskFunctionCallback, TaskConfig, TaskOptions } from './types.js'

export interface BuildOptions {
    [key: string]: any
}

export type BuildFunction = (bs: BuildStream, opts?: BuildOptions) => void | Promise<any>

//--- GBuildManager
export class Tron {
    protected _buildStreams: BuildStream[]

    constructor() {
        this._buildStreams = []
    }

    get buildStreams() { return this._buildStreams }

    /**
     * Create a gulp task with TaskConfig object
     * @param conf TaskConfig object
     */
    task(conf: TaskConfig): GulpTaskFunction

    /**
     *
     * @param name Task name (mandatory field)
     * @param build build function. if not specified, then defual null function is assigned internally.
     * @param opts TaskConfig object for additional task options
     */
    task(name: string, build?: BuildFunction, opts?: TaskOptions): GulpTaskFunction

    // overloading implementation for task() function
    task(arg1: TaskConfig | string, build?: BuildFunction, opts?: TaskOptions): GulpTaskFunction {
        const conf = (typeof arg1 === 'string') ? { name: arg1, build, ...opts } : arg1
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
    createTasks(...tasks: TaskConfig[]): GulpTaskFunction | GulpTaskFunction[] {
        let gulpTasks = tasks.reduce((list, task) => {

            list.push(this.task(task))
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
     * @param buildSet
     * @returns gulp task function of the gulp task tree constructed from buildSet. undefined there's no task.
     */
    resolveBuildSet(buildSet?: BuildSet): GulpTaskFunction | void {
        if (!buildSet) return

        // buildSet is gulp task name (BuildName)
        if (typeof buildSet === 'string') {
            const gulpTask = gulp.task(buildSet)
            if (!gulpTask) throw Error(`resolveBuildset: Task "${buildSet}" is not found.`)
            return gulpTask
        }

        // buildSet is gulp task function
        if (typeof buildSet === 'function') {
            if (/(series|parallel)/.test(buildSet.toString())) return buildSet
            if (gulp.task(buildSet.name)) return buildSet
            gulp.task(buildSet)
            return buildSet
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
            const { name, build, dependsOn, triggers, ...opts } = buildSet as TaskConfig
            if (!name) throw Error(`resolveBuildSet: invalid task name: ${name}`)

            const gulpTask = gulp.task(name)
            if (gulpTask) {
                // duplicated buil1d name may not be error in case it was resolved multiple time due to deps or triggers
                // So, info message is displayed only when verbose mode is turned on.
                // However, it's recommended to avoid it by using buildNames in deppendencies and triggers field of BuildConfig
                if (opts.logLevel == 'verbose') console.log(`resolveBuildSet:taskName=${name} already registered.`)
                return gulpTask
            }

            const deps = this.resolveBuildSet(dependsOn)
            const trig = this.resolveBuildSet(triggers)

            const bs = new BuildStream(name, opts)
            this._buildStreams.push(bs)
            const mainTask = async () => {
                if (!build) return Promise.resolve()
                await build(bs)
                return bs.flush()
            }
            mainTask.displayName = (deps) ? name + ':main' : name
            const tasks = [deps, mainTask, trig].filter(task => !!task) as GulpTaskFunction[]
            gulp.task(name, (tasks.length === 1) ? tasks[0] as GulpTaskFunction : gulp.series(...tasks))
            return gulp.task(name)
        }

        // buildSet is unknow - throw Error
        throw Error(`resolveBuildSet:Unknown type of buildSet: ${buildSet}`)
    }
}
