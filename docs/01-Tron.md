# Tron Class

## Overview

The `Tron` class extends the Gulp build system, providing advanced task management and stream build features. Tron class supports unified task registration, dependency management, cleaner/watcher/trigger features, and more.

## Key Features

- Task registration and management (`task`, `createTasks`)
- Task dependencies and triggers (`dependsOn`, `triggers`)
- Automatic cleaner task creation (`addCleaner`)
- File change detection and auto execution (`addWatcher`)
- Task selection and pattern matching (`selectTasks`)
- Gulp series/parallel wrappers (`series`, `parallel`)

## Constructor

```ts
new Tron(options?)
```

- `options`: Tron instance configuration object (optional)

## Methods

### `task(conf: TaskConfig): this`

Registers a task using a full `TaskConfig` object.

- `conf.name`: required task name.
- `conf.build`: optional build function that receives a `BuildStream` instance.
- `conf.dependsOn`: optional dependencies expressed as a `BuildSet`.
- `conf.triggers`: optional trigger tasks expressed as a `BuildSet`.
- `conf.src`, `conf.dest`, `conf.order`, `conf.sourcemaps`: build configuration options passed through to `BuildStream`.
- `conf.clean`: optional clean patterns used by cleaner tasks.
- `conf.watch`, `conf.addWatch`, `conf.browserSync`: watcher configuration options.

This overload is useful when a task needs a complete task configuration object.

### `task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions): this`

Registers a task by name with optional build logic and build options.

- `name`: required task name.
- `buildFunc`: optional function that receives a `BuildStream` instance and performs build operations.
- `opts`: optional `BuildOptions` to configure the task.

This overload is useful for simple tasks where only a name, build callback, and build options are needed.

### `createTasks(...confList: TaskConfig[]): this`

Registers multiple tasks at once.

- `confList`: one or more `TaskConfig` objects.

Each configuration object is processed through `task()` and registered individually.

### `addCleaner(options?: CleanerOptions): this`

Creates a cleaner task that deletes clean targets for selected tasks.

- `options.name`: optional cleaner task name. Defaults to `@clean`.
- `options.target`: optional task selector pattern or array of patterns to limit which tasks are cleaned.
- `options.clean`: optional glob or array of globs to add to the clean target list.
- `options.logLevel`: optional log verbosity for clean execution.
- `options.logger`: optional custom logger.

If `target` is omitted, the cleaner task aggregates clean targets from all registered tasks.

### `addWatcher(options?: WatcherOptions): this`

Creates a watcher task that observes file changes and triggers task execution.

- `options.name`: optional watcher task name. Defaults to `@watch`.
- `options.target`: optional task selector pattern or array of patterns to select watched tasks.
- `options.browserSync`: optional BrowserSync configuration to enable live reload.
- `options.watch`: optional file glob or array of globs to override default watch patterns.
- `options.addWatch`: optional extra watch patterns to supplement the default set.
- `options.logLevel`: optional log verbosity for watcher events.
- `options.logger`: optional custom logger.

The watcher task uses each selected task's `watch` or `src` patterns, and will also reload BrowserSync when configured.

### `series(...args: BuildSet[]): BuildSetSeries`

Creates a serial build set from a list of build items.

- `args`: task names, build functions, `TaskConfig` objects, or nested build sets.

Returns a `BuildSetSeries` array that can be passed to `task()`, `dependsOn`, or `triggers`.

### `parallel(...args: BuildSet[]): BuildSetParallel`

Creates a parallel build set from a list of build items.

- `args`: task names, build functions, `TaskConfig` objects, or nested build sets.

Returns a `BuildSetParallel` object with the shape `{ set: BuildSet[] }`.

### `selectTasks(patterns?: string | string[]): GulpTaskName[]`

Returns task names matching the selector patterns.

- `patterns`: optional glob string or array of glob strings.

If `patterns` is omitted or empty, returns an empty array. Negated patterns are supported.

### `selectTasksAll(): readonly GulpTaskName[]`

Returns all registered task names.

This method returns a snapshot of the currently registered tasks.

### `findTask(name?: string): TaskBlock | undefined`

Finds the stored task configuration for a given task name.

- `name`: optional task name.

Returns the `TaskBlock` configuration if found, otherwise `undefined`.

## Utility

- `isTaskConfig(value)`: Type guard to check whether a value is a `TaskConfig` object.
- `isValidTaskName(name)`: Validates a task name against reserved characters and whitespace rules.

## Example

```ts
import {Tron} from 'gulp-tron'
const tron = new Tron()

tron.task('build', bs => bs.src('src/**/*.js').pipe(...))
tron.addCleaner({clean: ['dist']})
tron.addWatcher()
```

## Notes

- BuildStream, series, parallel, etc. can be used together with the `Tron` class.
- For detailed usage, refer to the examples and test code.
