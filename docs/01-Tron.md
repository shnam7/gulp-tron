# Tron API

```ts
import tron from 'gulp-tron'
```
tron is an instance of Tron class, which creates and manages gulp tasks withTaskConfig objects.

## Properties

## Methods

### tron.use()
```ts
use(gulpInstance: typeof gulp) => void
```
Set gulp instance to use. Use this function to make sure the gulp instance you
want is actuall running.

#### Prameters
| name | description |
|:-----|-----|
| gulpInstance | gulp Instance to be used in the tron instance. |

#### Return value
None

### tron.task()
```ts
task(conf: TaskConfig) => this
task(name: string, buildFunc: BuildFunction, opts?: TaskOptions) => this
```
Create a gulp task with TaskConfig or build function.

#### Prameters
| name | description |
|:-----|-----|
| conf | TaskConfig oibject. |
| name | Task name (mandatory field). |
| buildFunc | Mian build function. if not specified, then default null function is assigned internally. |
| opts | TaskOptions. Refer to [README.md](../README.md) for more information. |

#### Return value
Tron instance itself.

### tron.createTask()
```ts
createTask(conf: TaskConfig) => this
```
Alias for `task(conf: TaskConfig)` or `createTasks()` with single TaskConfig object.

#### Prameters
| name | description |
|:-----|-----|
| conf | TaskConfig object. |

#### Return value
Tron instance itself.

### tron.createTasks()

```ts
createTasks(...confList: (TaskConfig | TaskOptions)[]) => this
```
Create multiple tasks sequencially.

#### Prameters
| name | description |
|:-----|-----|
| confList | List of TaskConfig objects. |

#### Return value
Tron instance itself.

### tron.addCleaner()
```ts
addCleaner(options: CleanerOptions = {}) => this
```
Create a task cleaning the output from the build and anything specified in the options.
Clean target includes the `conf.clean` value by default.

#### Prameters
| option | type | default | description |
|:-----:|:-----:|:-----:|-----|
| name? | string | @clean | Cleaner task name. |
| target? | all tasks | string or RegExp or array of them | target TaskConfig list to look for `conf.clean` properties. |
| clean? | string or string[] | undefined | additional clean targets to be added to TaskConfig, `conf.clean`. |
| delOptions? | DelOptions | undefined | Options to [`del`](https://github.com/sindresorhus/del) module. |

#### Return value
Tron instance itself.

### tron.addWatcher()
```ts
addWatcher(options: WatcherOptions = {}) => this
```
Create watcher task. Watcher task watches files specified in all the target
TaskConf `conf.src` valuies, and run the relevant main build function if change detected.

#### Prameters
| option | type | default | description |
|:-----:|:-----:|:-----:|-----|
| target? | all tasks | string or RegExp or array of them | target TaskConfig list to look for `conf.watch` properties. |
| browserSync? | object | undefined | Options to be passed to broiwser-sync. If defined, browser-sync is activated. |
| watch? | string or string[] | undefined | override default watch, which is TaskOptions `conf.src`. |
| addWatch? | string or string[] | undefined |  Additional watch items to be added to default watch list. |

#### Return value
Tron instance itself.

### tron.series()
```ts
export function series(...args: BuildSet[]) => BuildSetSeries
```
Convert series of buildSet items into buildSet Series object.

#### Parameters
| name | description |
|:-----|-----|
| args | list of BuildSet items. |

#### Return value
BuildSetSeries object of the buildSet list.

### tron.parallel()
```ts
export function parallel(...args: BuildSet[]) => BuildSetParallel
```
Convert the series of buildSet items into buildSet Parallel object.

#### Prameters
| name | description |
|:-----|-----|
| args | list of BuildSet items. |

#### Return value
BuildSetParallel object of the buildSet list

### tron.taskName()
```ts
taskName(name: string) => string | undefined
```
Convert TaskCoinfig name to gulp task name.

#### Prameters
| name | description |
|:-----|-----|
| name | TaskConfig `conf.name` |

#### Return value
Gulp task name, or undefined if no gulp task found.

### tron.selectTasks()
```ts
export type TaskSelector = (string | RegExp) | (string | RegExp)[]

selectTasks(filter?: TaskSelector) => TaskConfig[] | undefined
```
Select tasks with matching name to filter string or RegExp.

#### Prameters
| option | type | default | description |
|:-----:|:-----:|:-----:|-----|
| filter? | string or RegExp or array oif them | undefined | Task name selectors. |

#### Return value
List of select TaskConfig objects. Undefiend if filter is undefiend or not task found.

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
Find TaskConfig with the name.

#### Prameters
| name | description |
|:-----|-----|
| name | TaskConfig `conf.name`. It can be build name or task name prefixed with group name. |

#### Return value
TaskConfig object if found. Or undefined.

### tron.selectTasksByGroup()
```ts
selectTasksByGroup(groups?: TaskSelector) => TaskConfig[] | undefined
```
Select TaskConfigs with the group name.

#### Prameters
| option | type | default | description |
|:-----:|:-----:|:-----:|-----|
| groups? | string or RegExp or array oif them | undefined | Task name selectors. |

#### Return value
List of select TaskConfig objects. Undefiend if no match found with the groups parameter.
