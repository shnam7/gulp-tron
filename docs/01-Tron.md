# Tron Class Documentation

## Overview

The Tron class extends the Gulp build system, providing advanced task management and stream build features. Tron supports unified task registration, dependency management, cleaner/watcher/trigger features, and more.

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

### task(name, buildFn)

- Registers a task.
- `name`: Task name (string)
- `buildFn`: Build function (receives BuildStream instance)

### task(nameOrConfig, buildFn?, options?)

- Registers a task. Accepts either a `TaskConfig` object or (`name`, `buildFunc`, `options`) overload.
- `nameOrConfig`: Task name (string) or `TaskConfig` object
- `buildFn` (optional): Build function (receives `BuildStream` instance)

### createTasks(...configs)

- Registers multiple tasks at once using `TaskConfig` objects.
- `configs`: One or more task configuration objects

### createTasks(...configs)

- Registers multiple tasks at once.
- `configs`: Array of task configuration objects

### addCleaner(options)

- Registers a cleaner task.
- `options.clean`: Array of paths to delete

### addWatcher(options?)

- Registers a file watcher task.
- `options`: `WatcherOptions` with optional `browserSync` configuration and custom `watch` patterns

### selectTasks(patterns)

- Returns an array of task names matching the given patterns.
- `patterns`: string or string[] (supports wildcard/negation)

### selectTasksAll()

- Returns all registered task names as an array.

### addWatcher(options?)

- Registers a file watcher task.
- `options`: Watcher configuration object (optional)

### selectTasks(patterns)

- Returns an array of task names matching the given patterns.
- `patterns`: string or string[] (supports wildcard/negation)

### series(...tasks)

- Gulp series wrapper for sequential task execution

### parallel(...tasks)

- Gulp parallel wrapper for concurrent task execution

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

- BuildStream, series, parallel, etc. can be used together with Tron
- For detailed usage, refer to the examples and test code.
