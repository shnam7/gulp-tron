# Tron

`Tron` is the task registry and dependency manager used by `gulp-tron`.
It stores task definitions, resolves dependency trees, and creates the final gulp tasks that are run by the `gulp` CLI. If you are defining tasks in `gulp-tron`, `Tron` is the agent that keeps them organized and makes the task graph executable.

## Constructor

```ts
import { Tron } from "gulp-tron";

const tron = new Tron();
```

Takes no arguments.

## Reserved task names

`@clean` and `@watch` are reserved for the auto-generated `clean` and `watch` tasks.
If you register a custom task with either of those names without using the generated task behavior, `Tron` throws an error. In practice, keep those names as the framework-generated tasks and use your own names for project-level tasks.

## API

### task()

```ts
tron.task(conf: TaskConfig): this;
tron.task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions): this;
```

Registers a task using either a full `TaskConfig` object or a string name plus callback/options. Both overloads return `this` for chaining.

#### `task(conf)`

- **conf**: `TaskConfig`
  Full task configuration. Must include a valid `name`; may also include `build`, `dependsOn`, `triggers`, and any `BuildOptions` field (see [BuildOptions](#buildoptions)).

#### `task(name, buildFunc?, opts?)`

- **name**: `string`
  Task name. Must be non-empty, have no leading/trailing whitespace, and must not contain `" / \ | ? *`. Invalid or missing names throw.

- **buildFunc**: `BuildFunction` (optional)
  `(bs: BuildStream) => Promise<unknown> | undefined`. Function that performs the build for this task.
  - Default: no-op (task does nothing when run)

- **opts**: `BuildOptions` (optional)
  Additional options merged onto the task - e.g. `src`, `dest`, `dependsOn`, `triggers`, and cleaner/watcher settings (see [BuildOptions](#buildoptions)).
  - Default: `{}`

Examples:

```ts
tron.task({
  name: "scripts",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) => bs.src().dest(),
});

tron.task("copy", (bs) => bs.src("src/**/*.txt").dest("dist"));
```

### createTasks(...confList)

```ts
tron.createTasks(...confList: TaskConfig[]): this;
```

Registers each valid task in `confList` in order, equivalent to calling `task()` once per entry. Returns `this`.

- **confList**: `TaskConfig[]`
  List of full task configurations, each requiring a valid `name`. Entries that don't look like a `TaskConfig` are skipped silently.

```ts
tron.createTasks(conf1, conf2, conf3);
```

### addCleaner(options?)

```ts
tron.addCleaner(options?: CleanerOptions): this;
```

Creates a generated `@clean` task. It gathers the `clean` properties from selected tasks and executes them (along with `options.clean`) with `del`. Returns `this`.

- **options**: `CleanerOptions` (optional)
  See below.
  - Default: `{}`

`CleanerOptions` fields:

- **name**: `string` (optional)
  Name of the generated clean task.
  - Default: `"@clean"`

- **target**: `string | string[]` (optional)
  multimatch pattern(s) selecting which registered tasks' `clean` properties to gather.
  - Default: `"*"`

- **clean**: `string | string[]` (optional)
  Additional glob patterns to delete, independent of the selected tasks' own `clean` patterns.

- **logLevel**: `LogLevel` (optional)
  Overrides the log level for this task's logger. Takes precedence over `logger`'s own level.

- **logger**: `Logger` (optional)
  Custom logger instance to use instead of the default `@wicle/tiny-logger` logger.

- *(rest)*: `del` `Options`
  `CleanerOptions` also extends the `del` package's own options (e.g. `force`, `dryRun`, `cwd`), passed through to the actual delete call.

```ts
tron.addCleaner({
  target: "*",
  clean: ["dist"],
});
```

### addWatcher(options?)

```ts
tron.addWatcher(options?: WatcherOptions): this;
```

Creates a generated `@watch` task that monitors the relevant task patterns and optionally triggers BrowserSync reload. Returns `this`.

- **options**: `WatcherOptions` (optional)
  See below.
  - Default: `{}`

`WatcherOptions` fields:

- **name**: `string` (optional)
  Name of the generated watch task.
  - Default: `"@watch"`

- **target**: `string | string[]` (optional)
  multimatch pattern(s) selecting which registered tasks to watch.
  - Default: `"*"`

- **browserSync**: `BrowserSyncOptions` (optional)
  Options passed to `browser-sync`'s `.init()`. If set, BrowserSync starts and reloads on every watched file change.

- **watch**: `string | string[]` (optional)
  Overrides every selected task's own `watch`/`src` patterns (top-level replacement).

- **addWatch**: `string | string[]` (optional)
  Patterns to watch in addition to each task's own patterns (supplements, does not replace).

- **logLevel**: `LogLevel` (optional)
  Overrides the log level for this task's logger.

- **logger**: `Logger` (optional)
  Custom logger instance to use instead of the default logger.

For each selected task, the watched patterns are resolved as:

- base patterns: `options.watch` (top-level override) → else the task's own `watch` option → else the task's `src`
- plus the task's own `addWatch`
- plus the top-level `options.addWatch`

So a top-level `watch` replaces every selected task's own `src`/`watch` patterns, while `addWatch` (task-level or top-level) only supplements them. Set an individual task's `logLevel: "silent"` (via its own `TaskConfig`) to suppress the "change detected" log line for that task's watcher - BrowserSync reload, if enabled, still fires regardless of `logLevel`.

```ts
tron.addWatcher({
  browserSync: { server: "dist" },
  target: "*",
  addWatch: "src/public/**/*",
});
```

### series(...args) / parallel(...args)

```ts
tron.series(...args: BuildSet[]): BuildSetSeries;
tron.parallel(...args: BuildSet[]): BuildSetParallel;
```

`series()` returns a `BuildSetSeries` (a plain array run in order); `parallel()` returns a `BuildSetParallel` (`{ set: BuildSet[] }`, run concurrently). Use the results as `dependsOn`/`triggers` values on a `TaskConfig`.

- **args**: `BuildSet[]`
  Each item may be a registered task name (`string`), a `BuildFunction`, a `TaskConfig`, or a nested `BuildSetSeries`/`BuildSetParallel`.

Also available as standalone module-level functions, so you can use them without a `Tron` instance:

```ts
import { series, parallel } from "gulp-tron";

const runSerial = tron.series("taskA", "taskB");
const runParallel = tron.parallel("taskA", "taskB");
```

### selectTasks(patterns?)

```ts
tron.selectTasks(patterns?: string | string[]): GulpTaskName[];
```

Returns the matching task names, or `[]` if `patterns` is omitted, empty, or nothing matches.

- **patterns**: `string | string[]` (optional)
  multimatch glob pattern(s) matched against registered task names. Negation-only patterns (e.g. `"!foo"`) get `"*"` prepended implicitly.

```ts
tron.selectTasks("scripts");
tron.selectTasks(["styles", "scripts"]);
```

### selectTasksAll()

```ts
tron.selectTasksAll(): readonly GulpTaskName[];
```

Takes no arguments. Returns all registered task names, in registration order.

```ts
const tasks = tron.selectTasksAll();
```

### findTask(name?)

```ts
tron.findTask(name?: string): TaskBlock | undefined;
```

- **name**: `string` (optional)
  Task name to look up. Returns `undefined` if omitted or not registered.

`TaskBlock` is a `TaskConfig` with `dependsOn` and `triggers` omitted (the stored, already-resolved form of the task).

```ts
const task = tron.findTask("scripts");
```

### taskCount

```ts
tron.taskCount: number;
```

Read-only getter, takes no arguments. Returns the number of registered tasks.

```ts
tron.taskCount;
```

## Task resolution behavior

`Tron` resolves build sets (`BuildSet` values passed as `dependsOn`/`triggers`) recursively:

- task name (`string`) -> existing gulp task (throws if not found)
- `BuildFunction` -> anonymous task created from the function
- `TaskConfig` -> registered task config
- `BuildSetSeries` (array) -> serial set
- `BuildSetParallel` (`{ set: BuildSet[] }`) -> parallel set

This is the mechanism behind `dependsOn` and `triggers`.

## Option type reference

### BuildOptions

Shared options bag for `TaskConfig` (minus `name`/`build`/`dependsOn`/`triggers`) and the third argument of `task(name, buildFunc, opts)`. Combines `LogOptions`, `CleanerOptions` (minus `name`), `WatcherOptions` (minus `name`), plus:

- **src**: `string | string[]` (optional)
  Source files for the build operation.

- **order**: `string | string[]` (optional)
  Input file ordering patterns.

- **dest**: `string | ((file: File) => string)` (optional)
  Output destination directory.

- **sourcemaps**: `boolean` (optional)
  Sourcemaps option passed to `gulp.src()`/`gulp.dest()`.

### LogOptions

- **logLevel**: `LogLevel` (optional)
  Log level for this task; takes precedence over the level set on `logger`.

- **logger**: `Logger` (optional)
  Custom logger instance (from `@wicle/tiny-logger`) to use for this task.

## Typical example

```ts
import tron from "gulp-tron";

const scripts = {
  name: "scripts",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) => bs.src().pipe(/* plugin */).dest(),
};

const build = {
  name: "@build",
  triggers: tron.parallel(scripts),
  clean: "dist",
};

tron.task(scripts).task(build).addCleaner().addWatcher();
```

## Related docs

- [Getting Started](./00-Getting%20started.md)
- [BuildStream API](./02-BuildStream.md)
- [Type Reference](./04-Types.md)
