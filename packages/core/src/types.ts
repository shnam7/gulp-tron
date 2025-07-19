import type {Transform} from 'node:stream'
import type {SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback} from 'gulp'
import type {Options as BrowserSyncOptions} from 'browser-sync'
import type {Options as DelBaseOptions} from 'del'
import type {BuildStream} from './build-stream.js'

/*****************************************************************************
 *  Common Types
 *****************************************************************************/

// --- Gulp types
export type GulpStream = Transform | NodeJS.ReadWriteStream
export type GulpTaskName = string
export type GulpTaskFunction = TaskFunction
export type GulpTaskFunctionCallback = TaskFunctionCallback

// --- Log types
export type LogLevel = 'verbose' | 'normal' | 'silent'
export type LogOptions = {
    readonly logLevel?: LogLevel
    readonly logger?: (...args: readonly unknown[]) => void
}

// --- Utility types
export type SrcOptions = NonNullable<Parameters<SrcMethod>[1]>
export type DestOptions = NonNullable<Parameters<DestMethod>[1]>
export type SourceMaps = SrcOptions['sourcemaps'] & DestOptions['sourcemaps']
export type DelOptions = DelBaseOptions & LogOptions

// --- Clean options
export type CleanOptions = DelOptions

// --- Build Types -----------------------------------------------------------

export type BuildFunction = (bs: BuildStream) => void | Promise<unknown>

export type TaskConfig = {
    readonly name: string
    readonly build?: BuildFunction
    readonly dependsOn?: BuildSet
    readonly triggers?: BuildSet
} & BuildOptions

// --- Build Options
export type BuildOptions = {
    readonly src?: Parameters<SrcMethod>[0] // Source files for build operation
    readonly order?: string | string[] // Input file ordering patterns
    readonly dest?: Parameters<DestMethod>[0] // Output destination directory
    readonly sourcemaps?: boolean // Sourcemaps option for gulp.src() and gulp.dest()
} & Omit<CleanerOptions, 'name'> &
    Omit<WatcherOptions, 'name'> &
    LogOptions

// --- Cleaner options
export type CleanerOptions = {
    readonly name?: string // Cleaner task name (default: '@clean
    readonly target?: string | string[] // Target TaskConfig list to look for clean properties
    readonly clean?: string | string[] // Additional clean patterns
} & CleanOptions &
    LogOptions

// --- Watcher Options
export type WatcherOptions = {
    readonly name?: string // Watcher task name (default: '@watch')
    readonly target?: string | string[] // Target TaskConfig list to look for watch properties
    readonly browserSync?: BrowserSyncOptions // Browser-sync configuration options
    readonly watch?: string | string[] // Override default watch patterns (replaces conf.src)
    readonly addWatch?: string | string[] // Additional watch patterns (supplements watch or default)
} & LogOptions

// --- BuildSet types
export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = {readonly set: BuildSet[]}

// --- Plugin Types ----------------------------------------------------------

export type PluginFunction = (bs: BuildStream) => void
