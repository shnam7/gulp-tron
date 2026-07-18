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
  readonly name: string;
  readonly className: string;
  readonly stream: GulpStream;
  readonly promiseQ: Promise<unknown>;
  readonly opts: BuildOptions;
  readonly logger: (...args: Parameters<typeof console.log>) => void;
  readonly performance: {
    startTime: number;
    elapsedTime: number;
  };

  src(globsOrOptions?: Parameters<SrcMethod>[0] | SrcOptions, options?: SrcOptions): this;
  add(globs: Parameters<SrcMethod>[0], options?: SrcOptions): this;
  remove(patterns?: string | string[]): this;
  filter(...args: Parameters<typeof filterG>): this;
  rename(...args: Parameters<typeof renameG>): this;
  order(...args: Parameters<typeof orderG>): this;
  changed(dest?: Parameters<DestMethod>[0], options?: Parameters<typeof changedG>[1]): this;
  copy(globs: Glob, destPath: string, opts: CopyOptions): this;
  copy(params: CopyParam | CopyParam[], opts?: CopyOptions): this;
  del(patterns: Glob, options?: DelOptions): this;
  clean(cleanExtra?: string | string[], options?: CleanOptions): this;
  exec(command: string, options?: child_process.ExecSyncOptions): this;
  pipe(...args: Parameters<Transform["pipe"]>): this;
  log(...args: Parameters<typeof console.log>): this;
  promise(...args: unknown[]): this;
}
```

### Common types used by BuildStream

```ts
export type GulpStream = Transform | NodeJS.ReadWriteStream;

export type LogLevel = "verbose" | "normal" | "silent";

export type LogOptions = {
  readonly logLevel?: LogLevel;
  readonly logger?: (...args: readonly unknown[]) => void;
};

export type SrcOptions = NonNullable<Parameters<SrcMethod>[1]>;
export type DestOptions = NonNullable<Parameters<DestMethod>[1]>;
export type SourceMaps = SrcOptions["sourcemaps"] & DestOptions["sourcemaps"];
```

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

```ts
export type CopyParam = {
  readonly src: string | string[];
  readonly dest: string;
};

export type CopyOptions = LogOptions & {
  readonly showStats?: boolean;
  readonly force?: boolean;
  readonly prefix?: string;
  readonly dryRun?: boolean;
  readonly cwd?: string;
};

export type CopyResult = {
  copied: number;
  skipped: number;
  errors: number;
  message: string;
  srcPath: string;
  destPath: string;
};
```

### Exec utility types

```ts
export type ExecOptions = SpawnOptions & LogOptions;

export type ExecResult = {
  exitCode?: number;
  message?: string;
};
```

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
