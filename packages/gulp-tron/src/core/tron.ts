import gulp from 'gulp'
import { BuildStream } from './buildSream.js'
import type { BuildSet, BuildSetParallel, BuildSetSeries, GulpTaskFunction, GulpTaskFunctionCallback, TaskConfig } from './types.js'

export interface BuildOptions {
    [key: string]: any
}

export type BuildFunction = (bs: BuildStream, opts?: BuildOptions) => void | Promise<any>

//--- GBuildManager
export class Tron {
    constructor() {}

    task(conf: TaskConfig): void | Promise<void>

    task(name: string, build?: BuildFunction, dependsOn?: BuildSet): void | Promise<void>

    task(arg1: TaskConfig | string, build?: BuildFunction, dependsOn?: BuildSet): void | Promise<void> {
        const conf = (typeof arg1 === 'string') ? { name: arg1, build, dependsOn } : arg1
        resolveBuildSet(conf)
    }

    //--- utilities
    series(...args: BuildSet[]): BuildSetSeries { return args }
    parallel(...args: BuildSet[]): BuildSetParallel { return { set: args } }
}


/**
 * Convert buildSet to gulp task tree
 *
 * @param buildSet
 * @returns gulp task function of the gulp task tree constructed from buildSet. undefined there's no task.
 */
export const resolveBuildSet = (buildSet?: BuildSet): GulpTaskFunction | void => {
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
        return gulp.task(buildSet)
    }

    // buildSet is series set
    if (Array.isArray(buildSet)) {
        // strip redundant arrays
        while (buildSet.length === 1 && Array.isArray(buildSet[0])) buildSet = buildSet[0]

        let list = []
        for (let bs of buildSet) {
            let ret = resolveBuildSet(bs)
            if (ret) list.push(ret)
        }
        if (list.length === 0) return
        return list.length > 1 ? gulp.series(list) : list[0]
    }

    // buildSet is parallel set
    if (typeof buildSet === 'object' && buildSet.hasOwnProperty('set')) {
        let set = (<BuildSetParallel>buildSet).set
        while (set.length === 1 && Array.isArray(set[0])) set = set[0]

        console.log(`---1.0: set`, set)
        let list = []
        for (let bs of set) {
            let ret = resolveBuildSet(bs)
            if (ret) list.push(ret)
        }
        console.log(`---1.1: list`, list)
        if (list.length === 0) return
        return list.length > 1 ? gulp.parallel(list) : list[0]
    }

    // buildSet is TaskConfig object
    if (typeof buildSet === 'object') {
        const { name, build, dependsOn, triggers, logLevel } = buildSet as TaskConfig
        if (!name) throw Error(`resolveBuildSet: invalid task name: ${name}`)

        const gulpTask = gulp.task(name)
        if (gulpTask) {
            // duplicated buil1d name may not be error in case it was resolved multiple time due to deps or triggers
            // So, info message is displayed only when verbose mode is turned on.
            // However, it's recommended to avoid it by using buildNames in deppendencies and triggers field of BuildConfig
            if (logLevel == 'verbose') console.log(`resolveBuildSet:taskName=${name} already registered.`)
            return gulpTask
        }

        const deps = resolveBuildSet(dependsOn)
        const trig = resolveBuildSet(triggers)
        const mainTask = async () => {
            if (!build) return Promise.resolve()
            const bs = new BuildStream(name)
            await build(bs)
            return bs.flush()
        }
        mainTask.displayName = (deps) ? name + ':main' : name
        const tasks = [deps, mainTask, trig].filter(task => !!task) as GulpTaskFunction[]
        gulp.task(name, (tasks.length === 1) ? tasks[0] as GulpTaskFunction : gulp.series(...tasks))
        return gulp.task(name)
    }
    else {
        // buildSet is unknow - throw Error
        throw Error(`resolveBuildSet:Unknown type of buildSet: ${buildSet}`)
    }
}
