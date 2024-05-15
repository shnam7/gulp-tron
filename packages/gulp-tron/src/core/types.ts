import type { SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback } from 'gulp'
import type { BuildStream } from './buildSream.js'
import type { Options as browserSyncOptions } from 'browser-sync'
import type { Options as delOptions } from 'del'
import type { SpawnOptions } from 'child_process'
import type { ResultCallback } from 'streamx'


/*****************************************************************************
 *  Common Types
 *****************************************************************************/
export type GulpStream = ReturnType<SrcMethod>
export type GulpTaskName = string
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback
export type GulpTransformCallback = (file: any, cb: ResultCallback<any>) => void
export type TaskSelector = (string | RegExp) | (string | RegExp)[]

export type LogOptions = {
    logLevel?: 'verbose' | 'normal' | 'silent',
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

//--- Tron Task types
export type TaskConfig =
    {
        readonly name: string                           // build name
        readonly taskName?: string                      // this will be automaticallty set by Tron when gulp the task is actually created.
        readonly build?: BuildFunction                  // main build function
        readonly dependsOn?: BuildSet                   // buildSet to be executed before main build function
        readonly triggers?: BuildSet                    // buildSet to be executed after main build function
    }
    & TaskOptions

export type TaskOptions =
    {
        readonly group?: string                         // task group name
        readonly prefix?: boolean | string              // if false, no prefix for taskName. if true, group is used as prefix. if string, it becoms the prefix.
        readonly src?: Parameters<SrcMethod>[0]         // source for build operation
        readonly order?: string | string[]              // input file(src) ordering
        readonly dest?: Parameters<DestMethod>[0]       // output(destination) directory of the build operation
        readonly sourcemaps?: boolean                   // sourcemaps option to gulp.src() and gulp.dest()
    }
    & Omit<CleanerOptions, 'name'>
    & Omit<WatcherOptions, 'name'>
    & LogOptions

//--- Cleaner types
export type CleanerOptions =
    {
        readonly name?: string,                         // Cleaner task name. default value is '@clean'
        readonly target?: TaskSelector                  // target TaskConfig list to look for clean properties
        readonly clean?: string | string[]              // additional clean list
    }
    & CleanOptions
    & LogOptions

//--- Watcher types
export type WatcherOptions =
    {
        readonly name?: string                          // Watcher task name. default value is '@watch'
        readonly target?: TaskSelector                  // target TaskConfig list to look for watch properties
        readonly browserSync?: browserSyncOptions       // browser-options
        readonly watch?: string | string[]              // override default watch, which is TaskOptions.src
        readonly addWatch?: string | string[]           // additional watch in addition to watch or default watch
    }
    & LogOptions

//--- BuildSet
export type BuildSet =
    | GulpTaskName
    | BuildFunction
    | TaskConfig
    | BuildSetSeries
    | BuildSetParallel

export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = { set: BuildSet[] }


/*****************************************************************************
 *  Plugin Types
 *****************************************************************************/
export type PluginFunction = (bs: BuildStream) => void
