import type {Transform} from 'node:stream'
import type {SrcMethod, DestMethod, TaskFunction, TaskFunctionCallback, Gulp} from 'gulp'
import type {Options as BrowserSyncOptions} from 'browser-sync'
import type {Options as DelBaseOptions} from 'del'
import type {BuildStream} from './build-stream.js'

// --- Common Types ------------------------------------------------------------

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
export type CleanOptions = DelOptions

// --- Build Types ------------------------------------------------------------

// --- Task types
export type TaskConfig = {
    readonly name: GulpTaskName
    readonly build?: BuildFunction
    readonly dependsOn?: BuildSet
    readonly triggers?: BuildSet
} & BuildOptions

export type TaskBlock = Omit<TaskConfig, 'dependsOn' | 'triggers'>

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
export type BuildFunction = (bs: BuildStream) => void | Promise<unknown>
export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel
export type BuildSetSeries = BuildSet[]
export type BuildSetParallel = {readonly set: BuildSet[]}

// --- Plugin Types -----------------------------------------------------------

export type PluginFunction = (bs: BuildStream) => void

// --- Well-known task name constants -----------------------------------------

/** Default name used for the auto-generated clean task */
export const defaultCleanTaskName = '@clean'

/** Default name used for the auto-generated watcher task */
export const defaultWatchTaskName = '@watch'

/** Name assigned to BuildStream instances created without an explicit name */
export const anonymousTaskName = '<anonymous>'

// --- Utility functions ------------------------------------------------------

export const isValidTaskName = (name: string): boolean =>
    name.length > 0 && name.trim() === name && !/["\/\\\|?*]/v.test(name)

export const isTaskConfig = (value: unknown): value is TaskConfig =>
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as TaskConfig).name === 'string' &&
    isValidTaskName((value as TaskConfig).name)
