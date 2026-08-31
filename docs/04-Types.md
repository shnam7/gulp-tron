# Type Reference

This document summarizes the public API types exported by gulp-tron in a developer-friendly way, grouped by class and module.

> Source references: packages/gulp-tron/src/types.ts, packages/gulp-tron/src/build-stream.ts, packages/gulp-tron/src/tron.ts, and packages/gulp-tron/src/utils/\*.ts

---

## 1. Types related to the Tron class

The Tron class is responsible for task registration, dependency management, cleaner/watcher creation, and task selection.

### Tron

```ts
export class Tron {
  get taskCount(): number;
  task(conf: TaskConfig): this;
  task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions): this;
  createTasks(...confList: TaskConfig[]): this;
  addCleaner(options?: CleanerOptions): this;
  addWatcher(options?: WatcherOptions): this;
  series(...args: BuildSet[]): BuildSetSeries;
  parallel(...args: BuildSet[]): BuildSetParallel;
  selectTasks(patterns?: string | string[]): GulpTaskName[];
  selectTasksAll(): readonly GulpTaskName[];
  findTask(name?: string): TaskBlock | undefined;
}
```

### Task Configuration

```ts
export type TaskConfig = BuildOptions & {
  readonly name: GulpTaskName;
  readonly build?: BuildFunction;
  readonly dependsOn?: BuildSet;
  readonly triggers?: BuildSet;
};

export type TaskBlock = Omit<TaskConfig, "dependsOn" | "triggers">;
```

### BuildSet and BuildFuntion

```ts
export type BuildFunction = (bs: BuildStream) => Promise<unknown> | undefined;

export type BuildSet = GulpTaskName | BuildFunction | TaskConfig | BuildSetSeries | BuildSetParallel;

export type BuildSetSeries = BuildSet[];

export type BuildSetParallel = { readonly set: BuildSet[] };
```

### BuildOptions

```ts
export type BuildOptions = Omit<CleanerOptions, "name"> &
  Omit<WatcherOptions, "name"> &
  LogOptions & {
    readonly src?: Parameters<SrcMethod>[0];
    readonly order?: string | string[];
    readonly dest?: Parameters<DestMethod>[0];
    readonly sourcemaps?: boolean;
  };
```

### Cleaner and Watcher Options

```ts
export type CleanerOptions = CleanOptions &
  LogOptions & {
    readonly name?: string;
    readonly target?: string | string[];
    readonly clean?: string | string[];
  };

export type WatcherOptions = LogOptions & {
  readonly name?: string;
  readonly target?: string | string[];
  readonly browserSync?: BrowserSyncOptions;
  readonly watch?: string | string[];
  readonly addWatch?: string | string[];
};
```

### Default task name constants

```ts
export const defaultCleanTaskName = "@clean";
export const defaultWatchTaskName = "@watch";
export const anonymousTaskName = "<anonymous>";
```

### Task name and function types

```ts
export type GulpTaskName = string;
export type GulpTaskFunction = TaskFunction;
export type GulpTaskFunctionCallback = TaskFunctionCallback;
```

### Type guard helpers

```ts
export const isValidTaskName = (name: string): boolean => ...;
export const isTaskConfig = (value: unknown): value is TaskConfig => ...;
```

---

## 2. BuildStream class

The BuildStream class provides a fluent API for stream-based build operations such as sourcing, filtering, renaming, copying, deleting, and executing commands.

### BuildStream

```ts
export class BuildStream {
  // static factories/utilities
  static nullStream(): Transform;
  static through(transform?: TransformFunction, flush?: FlushFunction, options?: TransformOptions): Transform;
  static main(bs: BuildStream, buildFunc: BuildFunction): Promise<GulpStream>;

  readonly name: string;
  readonly className: string;
  readonly stream: GulpStream;
  readonly promiseQ: Promise<unknown>;
  readonly opts: BuildOptions;
  readonly logger: Logger; // from @wicle/tiny-logger — see the Logger note below
  readonly performance: {
    startTime: number;
    elapsedTime: number;
  };

  constructor(name?: string, opts?: BuildOptions, stream?: GulpStream, promiseQ?: Promise<unknown>);

  // source/stream composition
  src(globsOrOptions?: Parameters<SrcMethod>[0] | SrcOptions, options?: SrcOptions): this;
  add(globs: Parameters<SrcMethod>[0], options?: SrcOptions): this;
  remove(patterns?: string | string[]): this;
  filter(...args: Parameters<typeof filterG>): this;
  rename(...args: Parameters<typeof renameG>): this;
  order(...args: Parameters<typeof orderG>): this;
  changed(dest?: Parameters<DestMethod>[0], options?: Parameters<typeof changedG>[1]): this;

  // copy / delete / exec / write
  copy(globs: Glob, destPath: string, opts?: CopyOptions): this;
  copy(params: CopyParam | CopyParam[], opts?: CopyOptions): this;
  del(patterns: Glob, options?: DelOptions): this;
  clean(cleanExtra?: string | string[], options?: CleanOptions): this;
  exec(command: string, options?: child_process.ExecSyncOptions): this;
  dest(folder?: Parameters<DestMethod>[0], options?: DestOptions): this;
  reload(options?: browserSync.StreamOptions): this;

  // stream lifecycle
  clear(): this;
  clone(name?: string): BuildStream;
  on(...args: Parameters<GulpStream["on"]>): this;
  promise(func: () => unknown): this;
  promise(promise: Promise<unknown>): this;
  chain(func: PluginFunction): this;
  pipe(plugin: GulpStream | Transform, options?: { end?: boolean }): this;
  debug(title?: string, options?: DebugOptions): this;
  debug(options?: DebugOptions): this;
  through(transform?: TransformFunction, flush?: FlushFunction, options?: TransformOptions): this;
  intercept(interceptFunc?: TransformFunction, onFinish?: (cb: TransformCallback) => void): this;
  peek(peekFunc?: (file: Vinyl) => void, onFinish?: (cb: TransformCallback) => void): this;

  // completion / utility
  sync(): Promise<void>;
  finish(): Promise<void>;
  log(...args: Parameters<typeof console.log>): this;
  detachStream(): GulpStream;
}
```

This is a signature summary — see [BuildStream docs](./02-BuildStream.md) for the full behavior of each method (defaults, fallbacks, and side effects), since several methods (`src`, `dest`, `del`, `clean`, `copy`) have fallback/merge logic that isn't visible from the type signature alone.

### Common types used by BuildStream

```ts
export type GulpStream = Transform | NodeJS.ReadWriteStream;

// Re-exported from @wicle/tiny-logger
export type LogLevel = "trace" | "debug" | "verbose" | "info" | "warn" | "error" | "fatal" | "silent";

export type LogOptions = {
  readonly logLevel?: LogLevel; // takes precedence over logger.level
  readonly logger?: Logger; // from @wicle/tiny-logger
};

export type SrcOptions = NonNullable<Parameters<SrcMethod>[1]>;
export type DestOptions = NonNullable<Parameters<DestMethod>[1]>;
export type SourceMaps = SrcOptions["sourcemaps"] & DestOptions["sourcemaps"];
```

`Logger` is a leveled logger interface from [`@wicle/tiny-logger`](https://www.npmjs.com/package/@wicle/tiny-logger) — it extends `ts-log`'s `Logger` (`trace`/`debug`/`info`/`warn`/`error`/`fatal`) with an added `verbose` level. It is **not** a single `(...args) => void` callback. `gulp-tron` does not re-export the `Logger` type itself, so import it directly if you need to type a custom logger:

```ts
import type { Logger } from "@wicle/tiny-logger";

const myLogger: Logger = {
  /* trace, debug, verbose, info, warn, error, fatal */
};
```

To get a real, already-configured logger (e.g. to silence a specific call), use `getSilentLogger()` or `getDefaultLogger()` from `@wicle/tiny-logger` — see [Notes on `logLevel` vs a silent logger](./02-BuildStream.md#notes-on-loglevel-vs-a-silent-logger) in the BuildStream docs.

### Deletion and cleanup related types

```ts
export type DelOptions = DelBaseOptions & LogOptions;
export type CleanOptions = DelOptions;
```

### Plugin type

```ts
export type PluginFunction = (bs: BuildStream) => void;
```

---

## 3. Types from utility modules

The copy and exec utilities also expose public types that can be used by developers.

### Copy utility types

`BuildStream.copy()` delegates entirely to [`copy-changed`](https://www.npmjs.com/package/copy-changed), and `CopyParam`/`CopyOptions`/`CopyResult` are re-exported directly from that package (not redefined by gulp-tron) — so this reflects `copy-changed`'s current shape, and may drift if that package changes:

```ts
export interface CopyParam {
  src: string | readonly string[];
  dest: string;
  options?: CopyOptions; // per-param override, merged over the shared/default options
}

export interface CopyOptions {
  cwd?: string;
  clearDest?: boolean | string | readonly string[];
  force?: boolean;
  logger?: Logger;
  logLevel?: "normal" | "verbose" | "silent"; // copy-changed's own LogLevel, distinct from gulp-tron's LogLevel above
  globOptions?: GlobOptions; // from tinyglobby
  dryRun?: boolean;
  onCheckChanged?: (srcFile: string, destFile: string, options: Required<CopyOptions>) => boolean | Promise<boolean>;
  onClearDest?: (delPatterns: string[], options: Required<CopyOptions>) => void | Promise<void>;
  onCopy?: (srcFile: string, destFile: string, options: Required<CopyOptions>) => void | Promise<void>;
  onSkip?: (srcFile: string, destFile: string, options: Required<CopyOptions>) => void | Promise<void>;
  onFinish?: (result: CopyResult, options: Required<CopyOptions>) => void | Promise<void>;
}

export interface CopyResult {
  copyCount: number;
  skipCount: number;
}
```

When calling `bs.copy(params, opts)` with an array of `CopyParam`, `opts` is passed through as `copy-changed`'s `defaultOptions` — it's merged into every param, but each param's own `options` field wins over it. See [`copy-changed` on npm](https://www.npmjs.com/package/copy-changed) for the full behavior of the `onCheckChanged`/`onClearDest`/`onCopy`/`onSkip`/`onFinish` hooks.

### Exec utility types

There are two distinct `exec`-related APIs — don't confuse them:

- **`bs.exec(command, options?)`** (a `BuildStream` instance method) — takes `child_process.ExecSyncOptions` and runs the command via the callback-based `child_process.exec()` internally, queued on the stream's promise queue. See [BuildStream docs](./02-BuildStream.md#execcommand-options).
- **`exec(command, options?)`** (the standalone utility below, from `gulp-tron`'s `utils` module) — a separate helper built on `child_process.spawn()`.

```ts
export type ExecOptions = SpawnOptions & LogOptions;

export type ExecResult = {
  exitCode?: number;
  message?: string;
};

export function exec(command: string, options?: ExecOptions): Promise<ExecResult>;
```

`exec()`'s own output line (its `logger.info(ret.message)` at the end) is suppressed when `options.logLevel === "silent"` — this is the one place in gulp-tron where `logLevel` is actually checked directly in code, rather than relying on the logger instance's own level filtering.

---

## 4. Usage guide

### Registering a task with TaskConfig

```ts
const tron = new Tron();

tron.task({
  name: "build",
  src: "src/**/*.js",
  dest: "dist",
  build: (bs) => bs.src().pipe(/* ... */),
});
```

### Defining dependencies and triggers with BuildSet

```ts
tron.task({
  name: "all",
  dependsOn: tron.series("build", "copy"),
  triggers: tron.parallel("watch"),
});
```

### Chaining BuildStream operations

```ts
const bs = new BuildStream("build");
bs.src("src/**/*.js").filter("**/*.js").rename({ extname: ".min.js" }).dest("dist");
```

---

## 5. Notes

- The Tron and BuildStream classes are the core public API entry points for task management and stream processing.
- Most of the shared types are defined in packages/gulp-tron/src/types.ts, while Tron and BuildStream compose them in their own APIs.
- When extending the library or writing custom plugins, start with TaskConfig, BuildOptions, BuildSet, CopyOptions, and ExecOptions.
