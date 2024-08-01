import type {SpawnOptions} from 'node:child_process'
import {type Transform} from 'node:stream'
import type {SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback} from 'gulp'
import type {Options as browserSyncOptions} from 'browser-sync'
import type {Options as delOptions} from 'del'
import type {BuildStream} from './build-stream.js'

/*****************************************************************************
 *  Common Types
 *****************************************************************************/
export type GulpStream = Transform | NodeJS.ReadWriteStream
export type GulpTaskName = string
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback
// export type TaskSelector = (string | RegExp) | Array<string | RegExp>
// export type TaskSelector = string | string[]

export type LogOptions = {
    logLevel?: 'verbose' | 'normal' | 'silent'
    logger?: (...args: any[]) => void
}

export type SrcOptions = NonNullable<Parameters<SrcMethod>[1]>
export type DestOptions = NonNullable<Parameters<DestMethod>[1]>
export type SourceMaps = SrcOptions['sourcemaps'] & DestOptions['sourcemaps']

export type ExecOptions = SpawnOptions & LogOptions

export type DelOptions = delOptions & LogOptions

export type CleanOptions = DelOptions

/*****************************************************************************
 *  Build Types
 *****************************************************************************/
export type BuildFunction = (bs: BuildStream) => void | Promise<any>

// --- Tron Task types
export type TaskConfig = {
    readonly name: string // Build name
    // readonly taskName?: string // gulp task name. To be set by Tron when the gulp task is created.
    readonly build?: BuildFunction // Main build function
    readonly dependsOn?: BuildSet // BuildSet to be executed before main build function
    readonly triggers?: BuildSet // BuildSet to be executed after main build function
} & BuildOptions

export type BuildOptions = {
    // readonly grou p?: string // Task group name
    // readonly pref ix?: boolean | string // If false, no prefix for taskName. if true, group is used as prefix. if string, it becoms the prefix.
    readonly src?: Parameters<SrcMethod>[0] // Source for bu ild operation
    readonly order?: string | string[] // Input file(sr c) ordering
    readonly dest?: Parameters<DestMethod>[0] // Output(destin ation) directory of the build operation
    readonly sourcemaps?: boolean // Sourcemaps op tion to gulp.src() and gulp.dest()
} & Omit<CleanerOptions, 'name'> &
    Omit<WatcherOptions, 'name'> &
    LogOptions

// --- Cleaner t ypes
export type CleanerOptions = {
    readonly name?: string // Cleaner task  name. default value is '@clean'
    readonly target?: string | string[] // Target TaskCo nfig list to look for clean properties
    readonly clean?: string | string[] // Additional cl ean list
} & CleanOptions &
    LogOptions

// --- Watcher t ypes
export type WatcherOptions = {
    readonly name?: string // Watcher task  name. default value is '@watch'
    readonly target?: string | string[] // Target TaskCo nfig list to look for watch properties
    readonly browserSync?: browserSyncOptions // Browser-optio ns
    readonly watch?: string | string[] // Override default watch, conf.src
    readonly addWatch?: string | string[] // Additional wa tch in addition to watch or default watch
} & LogOptions

// --- BuildSet
export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel

export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = {set: BuildSet[]}

/*****************************************************************************
 *  Plugin Types
 *****************************************************************************/
export type PluginFunction = (bs: BuildStream) => void
