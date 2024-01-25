import upath from 'upath'
import { BuildSet, BuildSetSeries, BuildSetParallel, series, parallel, BuildItems, BuildNameSelector, BuildItem, BuilderClassType, GBuilder } from './builder.js'
import { Project, ProjectOptions } from './project.js'
import gulp, { Gulp } from 'gulp'
import { CopyBuilder } from './copyBuilder.js'
import { msg } from '../utils/log.js'
import { BuildStream } from './buildSream.js'

export interface BuildOptions {
    [key: string]: any
}

export type BuildFunction = (bs: BuildStream, opts?: BuildOptions) => void | Promise<any>

//--- GBuildManager
export class Tron {
    protected _gulp: Gulp = gulp
    protected _projects: Project[] = [];
    protected static _builderTypes: Map<string, BuilderClassType> = new Map()

    constructor() {
        Tron.registerBuilder(GBuilder)
        Tron.registerBuilder(CopyBuilder)
    }

    task(name: string, func: BuildFunction): void | Promise<void> {
        const bs = new BuildStream(name)
        gulp.task(name, async (callback) => {
            await func(bs)
            callback()
        })
    }

    //--- expose gulp
    get gulp(): typeof gulp { return this._gulp }
    get builderTypes() { return Tron._builderTypes }

    static registerBuilder(builderClass: BuilderClassType): void {
        const entry = Tron._builderTypes.get(builderClass.name)
        if (entry)
            msg(`registerBuilder:builderClass '${builderClass}' is already registered. Registration skipped.`)
        else
            Tron._builderTypes.set(builderClass.name, builderClass)
    }

    static createBuilderInstance(builderClassName?: string): GBuilder {
        const builderClass = Tron._builderTypes.get(builderClassName || 'GBuilder')
        if (!builderClass) throw Error(`createBuilder:"${builderClassName}" not found. It should be registered first with registerBuilder().`)
        return new builderClass()
    }

    createProject(buildItems: BuildItem | BuildItems = {}, options?: ProjectOptions): Project {
        let proj = new Project(buildItems, options)
        this._projects.push(proj)
        return proj
    }

    getBuildNames(selector: BuildNameSelector): string[] {
        let buildNames: string[] = []
        this._projects.forEach(proj => {
            buildNames = buildNames.concat(proj.getBuildNames(selector))
        })
        return buildNames
    }

    findProject(projectName: string): Project | undefined {
        for (let proj of this._projects)
            if (proj.projectName === projectName) return proj
        return undefined
    }

    // setPackageManager(packageManager: string | PackageManagerOptions) {
    //     return npm.setPackageManager(packageManager);
    // }


    //--- utilities
    series(...args: BuildSet[]): BuildSetSeries { return series(args) }
    parallel(...args: BuildSet[]): BuildSetParallel { return parallel(args) }
    // registerExtension(name: string, ext: RTBExtension): void { RTB.registerExtension(name, ext) }
    // loadExtension(globModules: string | string[]) { RTB.loadExtension(globModules) }
    // require(id: string) { return npm.requireSafe(id); }
    // install(ids: string | string[]) { return npm.install(ids); }    // TODO: add to docs

    //--- properties
    // get rtbs() { return GBuildManager.rtbs; }
    // get builders() { return __builders; }
    // get utils() { return __utils; }

    //--- statics
    // static rtbs: RTB[] = [];
}


//-- custom builders
// function __builders() {}
// namespace __builders { export const GBuilder = GBuilderClass; }
// registerPropertiesFromFiles(__builders, upath.join(__dirname, '../builders/*.js'))
