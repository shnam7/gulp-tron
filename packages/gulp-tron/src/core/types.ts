import type { task } from 'gulp'
import type { SpawnOptions } from 'child_process'
import type { Options as delOptions } from 'del'
import type { SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback } from 'gulp'
import type { BuildStream } from './buildSream.js'
import type { Options as browserSyncOptions } from 'browser-sync'

//--- common types
export type GulpStream = ReturnType<SrcMethod>
export type GulpTaskName = string
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback
export type GulpTaskFunctionWrapped = ReturnType<typeof task>
export type LogOptions = { logLevel?: 'verbose' | 'normal' | 'silent', logger?: (...args: any[]) => void }
export type ExecOptions = SpawnOptions & LogOptions
export type CleanOptions = delOptions & LogOptions
export type DelOptions = delOptions & LogOptions

//--- build types
export type BuildFunction = (bs: BuildStream) => void | Promise<any>

//--- Tron Task types
export type TaskConfig = {
    readonly name: string                           // build name
    readonly taskName?: string                      // this will be automaticallty set by Tron when gulp the task is actually created.
    readonly build?: BuildFunction                  // main build function
    readonly dependsOn?: BuildSet                   // buildSet to be executed before main build function
    readonly triggers?: BuildSet                    // buildSet to be executed after main build function
} & TaskOptions & CleanerConfig & WatcherConfig

export type TaskOptions = {
    readonly group?: string                         // task group name
    readonly prefix?: boolean | string              // if false, no prefix for taskName. if true, group is used as prefix. if string, it becoms the prefix.
    readonly src?: Parameters<SrcMethod>[0]         // source for build operation
    readonly order?: string | string[]              // input file(src) ordering
    readonly dest?: Parameters<DestMethod>[0]       // output(destination) directory of the build operation
    readonly sourcemaps?: boolean | string          // sourcemaps option to gulp.src() and gulp.dest()
} & CleanerOptions & WatcherOptions & LogOptions

//--- Cleaner types
export type CleanerConfig = {
    readonly name?: string,                         // Cleaner task name. default value is '@clean'
    readonly target?: TaskConfig | TaskConfig[]     // target TaskConfig list to look for clean properties
} & CleanerOptions

export type CleanerOptions = {
    readonly clean?: string | string[]              // additional clean list
} & CleanOptions


//--- Watcher types
export type WatcherConfig = {
    readonly name?: string                          // Watcher task name. default value is '@watch'
    readonly target?: TaskConfig | TaskConfig[]     // target TaskConfig list to look for watch properties
    readonly browserSync?: browserSyncOptions       // browser-options
} & WatcherOptions & LogOptions

export type WatcherOptions = {
    readonly watch?: string | string[]              // override default watch, which is TaskOptions.src
    readonly addWatch?: string | string[]           // additional watch in addition to watch or default watch
}

//--- BuildSet
export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = { set: BuildSet[] }

//--- plugin types
export type PluginFunction = (bs: BuildStream) => BuildStream
