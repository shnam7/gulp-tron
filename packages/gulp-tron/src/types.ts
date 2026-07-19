import type { Transform } from "node:stream";
import type { Options as BrowserSyncOptions } from "browser-sync";
import type { Options as DelBaseOptions } from "del";
import type { DestMethod, SrcMethod, TaskFunction, TaskFunctionCallback } from "gulp";
import type File from "vinyl";
import type { BuildStream } from "./build-stream.js";

// --- Common Types ------------------------------------------------------------

// --- Gulp types
export type GulpStream = Transform | NodeJS.ReadWriteStream;
export type GulpTaskName = string;
export type GulpTaskFunction = TaskFunction;
export type GulpTaskFunctionCallback = TaskFunctionCallback;

// --- Log types
export type LogLevel = "verbose" | "normal" | "silent";
export type LogOptions = {
  readonly logLevel?: LogLevel;
  readonly logger?: (...args: readonly unknown[]) => void;
};

// --- Utility types
export type SrcOptions = NonNullable<Parameters<SrcMethod>[1]>;
export type DestOptions = NonNullable<Parameters<DestMethod>[1]>;
export type SourceMaps = SrcOptions["sourcemaps"] & DestOptions["sourcemaps"];
export type DelOptions = DelBaseOptions & LogOptions;
export type CleanOptions = DelOptions;

// --- Build Types ------------------------------------------------------------

// --- Task types
export type TaskConfig = BuildOptions & {
  readonly name: GulpTaskName;
  readonly build?: BuildFunction;
  readonly dependsOn?: BuildSet;
  readonly triggers?: BuildSet;
};

export type TaskBlock = Omit<TaskConfig, "dependsOn" | "triggers">;

// --- Build Options
export type BuildOptions = Omit<CleanerOptions, "name"> &
  Omit<WatcherOptions, "name"> &
  LogOptions & {
    readonly src?: string | string[]; // Source files for build operation
    readonly order?: string | string[]; // Input file ordering patterns
    readonly dest?: string | ((file: File) => string); // Output destination directory
    readonly sourcemaps?: boolean; // Sourcemaps option for gulp.src() and gulp.dest()
  };

// --- Cleaner options
export type CleanerOptions = CleanOptions &
  LogOptions & {
    readonly name?: string; // Cleaner task name (default: '@clean
    readonly target?: string | string[]; // Target TaskConfig list to look for clean properties
    readonly clean?: string | string[]; // Additional clean patterns
  };

// --- Watcher Options
export type WatcherOptions = LogOptions & {
  readonly name?: string; // Watcher task name (default: '@watch')
  readonly target?: string | string[]; // Target TaskConfig list to look for watch properties
  readonly browserSync?: BrowserSyncOptions; // Browser-sync configuration options
  readonly watch?: string | string[]; // Override default watch patterns (replaces conf.src)
  readonly addWatch?: string | string[]; // Additional watch patterns (supplements watch or default)
};

// --- BuildSet types
export type BuildFunction = (bs: BuildStream) => Promise<unknown> | undefined;
export type BuildSet =
  | GulpTaskName
  | BuildFunction
  | TaskConfig
  | BuildSetSeries
  | BuildSetParallel;
export type BuildSetSeries = BuildSet[];
export type BuildSetParallel = { readonly set: BuildSet[] };

// --- Plugin Types -----------------------------------------------------------

export type PluginFunction = (bs: BuildStream) => void;

// --- Well-known task name constants -----------------------------------------

/** Default name used for the auto-generated clean task */
export const defaultCleanTaskName = "@clean";

/** Default name used for the auto-generated watcher task */
export const defaultWatchTaskName = "@watch";

/** Name assigned to BuildStream instances created without an explicit name */
export const anonymousTaskName = "<anonymous>";

// --- Utility functions ------------------------------------------------------

export const isValidTaskName = (name: string): boolean =>
  name.length > 0 &&
  name.trim() === name &&
  ['"', "/", "\\", "|", "?", "*"].every((disallowedChar) => !name.includes(disallowedChar));

export const isTaskConfig = (value: unknown): value is TaskConfig =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof (value as TaskConfig).name === "string" &&
  isValidTaskName((value as TaskConfig).name);
