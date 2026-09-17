# Type Reference

## TaskConfig

```ts
export type TaskConfig = BuildOptions & {
  readonly name: GulpTaskName;
  readonly build?: BuildFunction;
  readonly dependsOn?: BuildSet;
  readonly triggers?: BuildSet;
};

export type TaskBlock = Omit<TaskConfig, "dependsOn" | "triggers">;
```

- **name**: `GulpTaskName` (i.e. `string`)
  The task's unique name. See `isValidTaskName` below for the exact naming rules.

- **build**: `BuildFunction` (optional)
  The function that performs the task's work. A task with no `build` is a no-op (useful as a pure grouping node for `dependsOn`/`triggers`).

- **dependsOn**: `BuildSet` (optional)
  Tasks that must run to completion before this one starts.

- **triggers**: `BuildSet` (optional)
  Tasks that run once this task's own `build` function completes.

- **all other fields**: inherited from `BuildOptions` (see below) - `src`, `dest`, `order`, `sourcemaps`, plus the cleaner/watcher fields.

`TaskBlock` is the stored, already-resolved form of a task - the same shape as `TaskConfig` but without `dependsOn`/`triggers`, since those are resolved into the task's gulp dependency graph rather than kept as data. This is what `Tron.findTask()` returns.

## BuildSet and BuildFunction

```ts
export type BuildFunction = (bs: BuildStream) => Promise<unknown> | undefined;

export type BuildSet =
  | GulpTaskName
  | BuildFunction
  | TaskConfig
  | BuildSetSeries
  | BuildSetParallel;

export type BuildSetSeries = BuildSet[];
export type BuildSetParallel = { readonly set: BuildSet[] };
```

- **`BuildFunction`**: the shape every task's `build` function must have. It receives the task's `BuildStream` instance and may return a promise (awaited before the task is considered done) or nothing.

- **`BuildSet`**: any value accepted as a `dependsOn`/`triggers` entry - a registered task name, an inline `BuildFunction`, a full `TaskConfig`, or a nested series/parallel group. See [Task resolution behavior](./01-Tron.md#task-resolution-behavior) for how each variant is resolved.
  - `GulpTaskName` - runs the already-registered task with that name.
  - `BuildFunction` - runs as an anonymous, unregistered task.
  - `TaskConfig` - registers and runs a full task definition inline.
  - `BuildSetSeries` - a plain array; its entries run one after another.
  - `BuildSetParallel` - `{ set: [...] }`; its entries run concurrently.

### BuildOptions

```ts
export type BuildOptions = Omit<CleanerOptions, "name"> &
  Omit<WatcherOptions, "name"> &
  LogOptions & {
    readonly src?: string | string[];
    readonly order?: string | string[];
    readonly dest?: string | ((file: File) => string);
    readonly sourcemaps?: boolean;
  };
```

`BuildOptions` is the options bag shared by `TaskConfig` and the third argument of `Tron.task(name, buildFunc, opts)`. It's composed of `CleanerOptions` and `WatcherOptions` (each minus their own `name` field, since a task's name is `TaskConfig.name`, not a separate cleaner/watcher name) and `LogOptions`, plus:

- **src**: `string | string[]` (optional)
  Source files for the build operation. Read by `BuildStream.src()`/`add()` when no explicit glob is passed.

- **order**: `string | string[]` (optional)
  Input file ordering patterns. Read by `BuildStream.order()` when no explicit patterns are passed.

- **dest**: `string | ((file: File) => string)` (optional)
  Output destination. Read by `BuildStream.dest()`/`changed()` when no explicit destination is passed.

- **sourcemaps**: `boolean` (optional)
  Sourcemaps option used as the fallback for `gulp.src()`/`gulp.dest()` when not set explicitly on a given call.

### CleanerOptions and WatcherOptions

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

`CleanerOptions` is the options object accepted by `Tron.addCleaner()`:

- **name**: `string` (optional) - name of the generated clean task. Default: `"@clean"` ([`defaultCleanTaskName`](#default-task-names)).
- **target**: `string | string[]` (optional) - multimatch pattern(s) selecting which registered tasks' `clean` properties to gather. Default: `"*"`.
- **clean**: `string | string[]` (optional) - additional glob patterns to delete, independent of the selected tasks' own `clean` patterns.
- *(plus `CleanOptions` and `LogOptions` fields - see below)*

`WatcherOptions` is the options object accepted by `Tron.addWatcher()`, and (minus `name`) the set of per-task fields a `TaskConfig` can also carry to influence its own watch behavior:

- **name**: `string` (optional) - name of the generated watch task. Default: `"@watch"` ([`defaultWatchTaskName`](#default-task-names)).
- **target**: `string | string[]` (optional) - multimatch pattern(s) selecting which registered tasks to watch. Default: `"*"`.
- **browserSync**: `BrowserSyncOptions` (optional) - options passed to `browser-sync`'s `.init()`. Starts BrowserSync and reloads it on every watched change, if set.
- **watch**: `string | string[]` (optional) - overrides the selected task's own `src`/`watch` patterns.
- **addWatch**: `string | string[]` (optional) - patterns to watch in addition to the base patterns.

Full behavior and examples for both are in the [Tron API](./01-Tron.md#addcleaneroptions) doc.

## Default task names

```ts
export const defaultCleanTaskName = "@clean";
export const defaultWatchTaskName = "@watch";
export const anonymousTaskName = "<anonymous>";
```

- **`defaultCleanTaskName`**: the reserved name (`"@clean"`) used for the task `addCleaner()` generates.
- **`defaultWatchTaskName`**: the reserved name (`"@watch"`) used for the task `addWatcher()` generates.
- **`anonymousTaskName`**: the name (`"<anonymous>"`) given to a `BuildStream` instance created without an explicit `name`.

## Utility guards

```ts
export type GulpTaskName = string;
export type GulpTaskFunction = gulpNS.TaskFunction;
export type GulpTaskFunctionCallback = gulpNS.TaskFunctionCallback;

export const isValidTaskName = (name: string): boolean => ...;
export const isTaskConfig = (value: unknown): value is TaskConfig => ...;
```

- **`GulpTaskName`**: an alias for `string`, used wherever a task name is expected.
- **`GulpTaskFunction`** / **`GulpTaskFunctionCallback`**: re-exports of gulp's own `TaskFunction`/`TaskFunctionCallback` types, for typing raw gulp tasks alongside `gulp-tron` ones.
- **`isValidTaskName(name)`**: returns `true` when `name` is non-empty, has no leading/trailing whitespace, and contains none of `" / \ | ? *`.
- **`isTaskConfig(value)`**: a type guard - returns `true` when `value` is an object with a `name` field that itself passes `isValidTaskName`.

---

## LogOptions

```ts
export type { LogLevel } from "@wicle/tiny-logger";

export type LogOptions = {
  readonly logLevel?: LogLevel;
  readonly logger?: Logger;
};

export type { SrcOptions, DestOptions } from "vinyl-fs";
export type SourceMaps = SrcOptions["sourcemaps"] & DestOptions["sourcemaps"];
```

- **`logLevel`**: re-exported as-is from `@wicle/tiny-logger`.
  Currently available values are `"trace"` | `"debug"` | `"verbose"` | `"info"` | `"warn"` | `"error"` | `"fatal"` | `"silent"`
- **`logger`**: Logger type from `@wicle/tiny-logger`. Use it when you need a custom logger with a real, level-aware implementation. A plain `ts-log` logger (e.g. `console`) doesn't satisfy this by itself; wrap it with `@wicle/tiny-logger`'s `withVerbose()` helper first.

## CleanOptions

```ts
export type DelOptions = DelBaseOptions & LogOptions;
export type CleanOptions = DelOptions;
```

- **`DelBaseOptions`**: an internal alias for the `del` package's own `Options` type (`import type { Options as DelBaseOptions } from "del"`) - not itself exported, but every field of `del`'s `Options` (e.g. `force`, `dryRun`, `cwd`) is available on `DelOptions`.
- **`DelOptions`**: `del`'s options plus `LogOptions` - used by `BuildStream.del()`.
- **`CleanOptions`**: currently identical to `DelOptions` - used by `BuildStream.clean()` and `Tron.addCleaner()`.

## PluginFunction

```ts
export type PluginFunction = (bs: BuildStream) => void;
```

The shape of a function passed to `BuildStream.chain()` - synchronous, and expected to call other `BuildStream` methods on `bs` directly rather than return a new value.

## CopyOptions

The copy API is re-exported directly from `copy-changed`, so the public types match that library's current API shape.

```ts
export type CopyOptions = import("copy-changed").CopyOptions;
export type CopyParam = import("copy-changed").CopyParam;
export type CopyResult = import("copy-changed").CopyResult;
```

- **`CopyParam`**: `{ src: string | readonly string[]; dest: string; options?: CopyOptions }` - one entry in a multi-file copy call.
- **`CopyResult`**: `{ copyCount: number; skipCount: number }` - returned by a copy operation once it finishes.
- **`CopyOptions`**: `copy-changed`'s full options type (`cwd`, `destType`, `clearDest`, `force`, `logger`, `logLevel`, `globOptions`, `dryRun`, and the `onCheckChanged`/`onClearDest`/`onCopy`/`onSkip`/`onFinish` hooks) - see `copy-changed`'s own README for the complete field-by-field reference.

## ExecOptions

```ts
export type ExecOptions = import("node:child_process").SpawnOptions &
  LogOptions & {
    readonly throwOnError?: boolean;
  };

export type ExecResult = {
  exitCode?: number;
  message?: string;
};

export async function exec(command: string, options?: ExecOptions): Promise<ExecResult>;
```

- **`exitCode`**: process exit code (`0` for success, non-zero for failure).
- **`message`**: error message (empty string on success).
- **`throwOnError`**: when `true`, rejects the promise on failure; when `false` (default), resolves with an error message instead of throwing.

Intended use, per the earlier version of this doc: running commands outside the main build stream pipeline - linting, formatting, or pre-flight checks that should fail the build on error.

## Related docs

- [Getting Started](./00-Getting%20started.md)
- [Tron API](./01-Tron.md)
- [BuildStream API](./02-BuildStream.md)
