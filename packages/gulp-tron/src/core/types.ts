import type { SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback } from 'gulp'
import type { BuildStream } from './buildSream.js'

//--- common types
export type GulpStream = ReturnType<SrcMethod>
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback
export type LogOptions = { logLevel?: 'normal' | 'verbose' | 'silent' }

//--- build types
export type BuildFunction = (bs: BuildStream, opts?: BuildOptions) => void | Promise<any>
export type BuildOptions = {
    // [key: string]: any
}
export type TaskConfig = LogOptions & {
    name: string                            // build name
    build?: BuildFunction                   // main build function
    dependsOn?: BuildSet

    // preBuild?: BuildFunction            // function to be executed before build
    // postBuild?: BuildFunction           // function to be executed after build

    // builder?: BuilderType               // main build operations in various form: function, object, class, etc
    // src?: Parameters<SrcMethod>[0]      // source for build operation
    // dest?: Parameters<DestMethod>[0]    // output(destination) directory of the build operation
    // // order?: string[];                // input file(src) ordering
    // outFile?: string                    // optional output file name
    // // buildOptions?: Options              // buildConfig instance specific custom options
    // // moduleOptions?: Options             // gulp module options
    // dependencies?: BuildSet             // buildSet to be executed before this build task
    // triggers?: BuildSet                 // buildSet to be executed after this build task
    // watch?: string | string[]           // override default watch, 'src' if defined
    // addWatch?: string | string[]        // additional watch in addition to watch or default watch
    // clean?: string | string[]           // clean targets
    // flushStream?: boolean               // finish all the output streams before exiting gulp task
    // reloadOnChange?: boolean            // Reload on change when watcher is running. default is true.
    // verbose?: boolean,                  // print verbose messages
    // silent?: boolean,                   // depress informative messages
    // [key: string]: any
}

// //--- BuildItem
// export type BuildItem = BuildConfig | WatcherConfig | CleanerConfig
// export type BuildItems = { [key: string]: BuildItem }

//--- BuildSet
export type BuildName = string
// export type BuildNameSelector = string | string[] | RegExp | RegExp[]
// export type BuildSet = BuildName | GulpTaskFunction | BuildItem | BuildSetSeries | BuildSetParallel
// export type BuildSet = BuildName | BuildFunction | BuildSetSeries | BuildSetParallel
export type BuildSet = BuildName | GulpTaskFunction | TaskConfig | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = { set: BuildSet[] }
// export function series(...args: BuildSet[]): BuildSetSeries { return args }
// export function parallel(...args: BuildSet[]): BuildSetParallel { return { set: args } }


//--- plugin types
export type PluginFunction = (bs: BuildStream, opts: PluginOptions) => BuildStream
export type PluginOptions = { [key: string]: any }


// export type CopyParam = { src: string | string[], dest: string }

//--- BuilderType
// export type BuilderClassName = string
// export type BuilderType = BuilderClassName | BuildFunction | ExternalCommand | BuildStream | 'cleaner' | 'watcher'
// export type BuilderClassType = typeof BuildStream




// type SRC = Parameters<SrcMethod>


//--- BuildConfig

// //--- WatcherConfig (Watcher task config)
// export interface WatcherConfig extends Pick<BuildConfig, "watch"> {
//     name?: string                  // optional buildName. if undefined, defaults to '@watch'
//     builder: 'watcher',             // MUST be literal constant 'watcher'
//     filter?: BuildNameSelector,     // filter for buildNames (inside the project) to be watched
//     browserSync?: ReloaderOptions  // browserSync initializer options
//     livereload?: ReloaderOptions   // livereload initializer options
// }

// //--- CleanerConfig (Cleaner task config)
// export interface CleanerConfig extends Pick<BuildConfig, "clean">, CleanOptions {
//     name?: string                  // optional buildName. if undefined, defaults to '@clean'
//     builder: 'cleaner',             // MUST be literal constant 'cleaner'
//     filter?: BuildNameSelector,     // filter for buildNames (inside the project) to be cleaned
// }

// export interface TaskOptions extends Omit<BuildConfig, 'name' | 'builder'> {
//     buildOptions: Options
//     moduleOptions: Options
//     [key: string]: any
// }

// export interface CleanOptions extends del.Options {
//     clean?: string | string[]
// }
