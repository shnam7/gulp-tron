# Tron API

```ts
import tron from '@gulp-tron/core'
```

Tron is a task manager which creates and manages gulp tasks using configuration defined by TaskConfig object.

## Methods

### tron.task()

```ts
task(conf: TaskConfig) => this
task(name: string, buildFunc?: BuildFunction, opts?: BuildOptions) => this
```

Create a gulp task with TaskConfig or build function.

#### Prameters

| name      | description                                                               |
| :-------- | ------------------------------------------------------------------------- |
| conf      | `TaskConfig` oibject.                                                     |
| name      | Task name (required).                                                     |
| buildFunc | Main build function. if not specified, default null function is assigned. |
| opts      | Build options                                                             |

Note: Refer to [README.md](../README.md) for more information on data types.

#### Return value

Tron instance itself.

### tron.createTask()

```ts
createTask(conf: TaskConfig) => this
```

Alias for `task(conf: TaskConfig)`. Equivalent to calling `createTasks()` with single TaskConfig object.

#### Prameters

| name | description        |
| :--- | ------------------ |
| conf | TaskConfig object. |

#### Return value

Tron instance itself.

### tron.createTasks()

```ts
createTasks(...confList: (TaskConfig | BuildOptions)[]) => this
```

Create multiple tasks in a given sequence.

#### Prameters

| name     | description                 |
| :------- | --------------------------- |
| confList | List of TaskConfig objects. |

#### Return value

Tron instance itself.

### tron.addCleaner()

```ts
addCleaner(options: CleanerOptions = {}) => this
```

Create a task cleaning all the clean targets(`conf.clean`) of the selected tasks,
and optional targets specified in options.clean.

#### Prameters

**options**
Has following periperties:

|   options   |               type               |  default  | description                                                     |
| :---------: | :------------------------------: | :-------: | --------------------------------------------------------------- |
|    name?    |              string              |  @clean   | Cleaner task name.                                              |
|   target?   | string, RegExp, or array of them | all tasks | task selector.                                                  |
|   clean?    |        string or string[]        | undefined | additional clean targets.                                       |
| delOptions? |            DelOptions            | undefined | Options to [`del`](https://github.com/sindresorhus/del) module. |

#### Return value

Tron instance itself.

### tron.addWatcher()

```ts
addWatcher(options: WatcherOptions = {}) => this
```

Create watcher task, which watches files specified in `conf.src` of the selected tasks.
If `conf.watch` is defined for a TaskConfig, `conf.src` is repaced with this.
To add additional watch targets, use `options.addWatch`.

#### Prameters

**options**
Has following periperties:

|    option    |               type               |  default  | description                                                                   |
| :----------: | :------------------------------: | :-------: | ----------------------------------------------------------------------------- |
|   target?    | string, RegExp, or array of them | all tasks | task selector.                                                                |
| browserSync? |              object              | undefined | Options to be passed to broiwser-sync. If defined, browser-sync is activated. |
|    watch?    |        string or string[]        | undefined | override default watch `conf.src`.                                            |
|  addWatch?   |        string or string[]        | undefined | Additional watch items to be added to default watch list.                     |

#### Return value

Tron instance itself.

### tron.series()

```ts
export function series(...args: BuildSet[]) => BuildSetSeries
```

Convert series of buildSet items into buildSet Series object.

#### Parameters

| name | description             |
| :--- | ----------------------- |
| args | list of BuildSet items. |

#### Return value

BuildSetSeries object created from `args`.

### tron.parallel()

```ts
export function parallel(...args: BuildSet[]) => BuildSetParallel
```

Convert the series of buildSet items into buildSet Parallel object.

#### Prameters

| name | description             |
| :--- | ----------------------- |
| args | list of BuildSet items. |

#### Return value

BuildSetParallel object created from `args`.

### tron.selectTasks()

```ts
selectTasks(patterns?: string | string[]): TaskConfig[] | undefined
```

Select tasks with glob patters.

#### Prameters

|  option   |        type        |  default  | description                                                                                                          |
| :-------: | :----------------: | :-------: | -------------------------------------------------------------------------------------------------------------------- |
| patterns? | string or string[] | undefined | Task name selector patterns. Refer to [multimatch](https://github.com/sindresorhus/multimatch) for more information. |

#### Return value

List of selected TaskConfig objects. Undefiend if filter is undefiend or no task found.

### tron.selectTasksAll()

```ts
selectTasksAll() => TaskConfig[]
```

#### Return value

List of all TaskConfig objects registered to Tron.

### tron.findTask()

```ts
findTask(name?: string) => TaskConfig | undefined
```

Find TaskConfig with a name.

#### Prameters

| name | description            |
| :--- | ---------------------- |
| name | task name to look for. |

#### Return value

TaskConfig object if found. Or undefined.

### tron.use()

```ts
use(gulpInstance: typeof gulp) => void
```

Set gulp instance to use. Use this function to make sure you are using the gulp instance you
intent to use.

#### Prameters

| name         | description                     |
| :----------- | ------------------------------- |
| gulpInstance | gulp Instance to use with tron. |

#### Return value

None
