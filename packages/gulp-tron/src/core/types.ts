import gulp from 'gulp'
import type { SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback } from 'gulp'
import type { BuildStream } from './buildSream.js'
import { ExecSyncOptionsWithBufferEncoding, ExecSyncOptionsWithStringEncoding } from 'child_process'
import { Options as delOptions } from 'del'
import { WatchOptions } from 'fs'


//--- common types
export type GulpStream = ReturnType<SrcMethod>
export type GulpTaskName = string
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback
export type GulpTaskFunctionWrapped = ReturnType<typeof gulp.task>
export type LogOptions = { logLevel?: 'verbose' | 'normal' | 'silent', logger?: (...args: any[]) => void }
export type ExecOptions = ExecSyncOptionsWithBufferEncoding | ExecSyncOptionsWithStringEncoding
export type CleanOptions = delOptions & LogOptions
export type DelOptions = delOptions & LogOptions

//--- build types
export type BuildFunction = (bs: BuildStream) => void | Promise<any>

//--- Tron Task types
export type TaskConfig = {
    name: string                            // build name
    taskName?: string                       // this will be automaticallty set by Tron when gulp the task is actually created.
    build?: BuildFunction                   // main build function
    dependsOn?: BuildSet                    // buildSet to be executed before main build function
    triggers?: BuildSet                     // buildSet to be executed after main build function
} & TaskOptions & CleanerConfig & WatcherConfig

export type TaskOptions = {
    group?: string                          // task group name
    prefix?: boolean | string               // if false, no prefix for taskName. if true, group is used as prefix. if string, it becoms the prefix.
    src?: Parameters<SrcMethod>[0]          // source for build operation
    order?: string | string[]              // input file(src) ordering
    dest?: Parameters<DestMethod>[0]        // output(destination) directory of the build operation
    sourcemaps?: boolean | string           // sourcemaps option to gulp.src() and gulp.dest()
    // reloadOnChange?: boolean             // Reload on change when watcher is running. default is true.
} & CleanerOptions & WatcherOptions & LogOptions


//--- Cleaner types
export type CleanerConfig = {
    name?: string,                          // Cleaner task name. default value is '@clean'
    target?: TaskConfig | TaskConfig[]      // target TaskConfig list to look for clean properties
} & CleanerOptions

export type CleanerOptions = {
    clean?: string | string[]               // additional clean list
} & CleanOptions


//--- Watcher types
export type WatcherConfig = {
    name?: string                           // Watcher task name. default value is '@watch'
} & WatchOptions

export type WatcherOptions = {
    watch?: string | string[]               // override default watch, which is TaskOptions.src
    addWatch?: string | string[]            // additional watch in addition to watch or default watch
}

//--- BuildSet
export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = { set: BuildSet[] }

//--- plugin types
export type PluginFunction = (bs: BuildStream) => BuildStream

// //--- WatcherConfig (Watcher task config)
// export interface WatcherConfig extends Pick<BuildConfig, "watch"> {
//     name?: string                  // optional buildName. if undefined, defaults to '@watch'
//     builder: 'watcher',             // MUST be literal constant 'watcher'
//     filter?: BuildNameSelector,     // filter for buildNames (inside the project) to be watched
//     browserSync?: ReloaderOptions  // browserSync initializer options
//     livereload?: ReloaderOptions   // livereload initializer options
// }
