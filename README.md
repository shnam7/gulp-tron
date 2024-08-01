# gulp-tron

Easy to use, configuration based gulp build manager. Users can create gulp tasks with simple configuration. At the same time, users can defien build function as part of the configuration leveraging BuildStream API.

It provides major two benefits:

-   Easy to building task dependency hierarchy.
-   Easy to define build process leveraging BuildStream API.

Focus on build actions, rather than environment setup.

## Features

-   Quick and easy gulp task creation using configuration.
-   Rich BuildStream API to help define build process.
-   Easy to add clean and watch tasks with minimal efforts
-   Browser-sync support in the build configuration.
-   Easy Plugin support to develop and share build actions.
-   Tested with gulp 5 and streamx.

## Installation

```bash
npm i --save-dev gulp gulp-tron

# or
yard add -D gulp gulp-tron

# or
pnpm add -D gulp gulp-tron
```

gulp is required as peer dependency, to run gulp-tron.

## Quick example: gulpfile.js

```js
import tron from 'gulp-tron'
import path from 'path'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babel from 'gulp-babel'
import {fileURLToPath} from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

//--- project settings
const basePath = path.relative(process.cwd(), __dirname)
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const sass = gulpSass(dartSass)

//--- scss build configuration
const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sass().on('error', sass.logError)).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

//--- scripts build configuration
const scripts = {
    name: 'scripts',
    build: bs => bs.src().pipe(babel()).dest(),

    src: path.join(srcRoot, 'js/**/*.js'),
    dest: path.join(destRoot, 'js'),
}

//--- main build configuration
const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: path.join(destRoot, '{css,js}'),
}

// now create build task. Then it also creates dependent tasks recurrsively.
tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: path.join(destRoot, '**/*.html'),
        browserSync: {server: destRoot},
    })
```

Now you can see the gulp tasks created from this with `gulp --tasks` command:

```bash
$ pnpm gulp --tasks
Tasks for ~/dev/public/gulp-tron/examples/00-getting-started/gulpfile.js
├── scss
├── scripts
├─┬ @build
│ └─┬ <parallel>
│   ├── scss:main
│   └── scripts:main
├── @clean
└── @watch
```

With this TaskConfig,

-   `scss` and `scripts` tasks were created.
-   `@build` task has two parallel tasks: `scss:main` and `script:main`
-   `@clean` and `@watch` tasks were also created.
-   `@clean` task captures all the conf.clean properties as clean target automatically.
-   `@watch` task captures all the conf.src properties as watch target automatically.
-   `bs` is an instance of `BuildStream` automatically created by the task.
-   `scss:main` and `script:main` are display names referring to `scss` and `scripts` tasks.

## Tron

```ts
import tron from 'gulp-tron'
```

tron is an instance of Tron class, which is gulp task manager. It creates tasks
with dependency hierarchy based on TaskConfig settings.

`Tron` provides following API.
Refer to [Tron](./docs/01-Tron.md) for more details.

**Tron API**
| name | descrption |
|:-----:|-----|
| use() | Set gulp instance to use. |
| task() | Create a gulp task. |
| createTask() | Alias for task(conf: TaskConfig) or createTasks() with single TaskConfig object. |
| createTasks() | Create multiple tasks sequencially. |
| addCleaner() | Create a task cleaning the output from the build and anything specified in the options. |
| addWatcher() | Create task watching tasks. |
| series() | Convert the series of buildSet items into buildSet series object. |
| parallel() | Convert the series of buildSet items into buildSet parallel object. |
| taskName() | Convert TaskCoinfig name to gulp task name. |
| selectTasks | Return list of TaskConfig items that matches filter criteris. |
| selectTasksAll() | Return list of all the TaskConfig items. |
| findTask() | Find gulp task with name. Returns GulpTaskFunction if found, or undefined. |
| selectTasksByGroup() | Find TaskConfigs with a group name. |

## TaskConfig

Object type defining a build task, which has 1-to-1 connection to gulp task. It has one
mandatory property, **name**, and many optional optional properties.

```ts
const conf = {
    name: 'taskName'
    ...
}

tron.createTask(conf)
```

### conf.name

```ts
readonly name: string
```

Name of the TaskConfig. This becomes the gulp task name unless group property specified.
This is a mandatory field to define a task configuration.

### conf.build

The main build function of `BuildFunction` type. This is effectively the body of the gulp task.

```ts
export type BuildFunction = (bs: BuildStream) => void | Promise<any>
```

When the gulp task is executed, `BuildStream` instance connected to the this TaskConfig is created
and passed to the `conf.build` function.

If not specified, then default null function is used.

### conf.dependsOn

```ts
readonly dependsOn?: BuildSet
```

BuildSet to be executed **before** main build function, `conf.build`.
`BuildSet` can be a single task or a set of tasks combined with tron.series() or tron.parallel() functions.

It can be of the following:

-   task name - `conf.name` of other TaskConfig object.
-   BuildFunction - annonymous task instantly created.
-   TaskConfig object
-   BuildSetSeries - return value of tron.series(), or an array of `BuildSet`.
-   BuildSetParallel - return value of tron.parallel()

**BuildSet Examples**

```ts
const build1 = {name: 'build1'}
const build2 = {name: 'build2', build: bs => console.log(`${bs.name} executed`)}
function buildFunc(bs) {
    console.log('gulpTaskFunc: Hello, Lake!')
}
gulp.task('nativeGulpTask', done => done())

const set01 = [build1] // series of single task. Same as build1
const set02 = [build1, build2, buildFunc, 'nativeGulpTask'] // series
const set03 = tron.parallel(build1, build2)
const set04 = tron.series(build1, build2)
const set05 = [build1, build2] // serial set, the same as set04
const set06 = tron.parallel(set01, set02, set03, set04, set05)
```

### conf.triggers

```ts
readonly triggers?: BuildSet
```

The same as conf.dependsOn except that it is executed **after** main build function.

### BuildOptions

`TaskConfig` can have additional properties as option.

|  opotion   |        type        | description                                                                                                       |
| :--------: | :----------------: | ----------------------------------------------------------------------------------------------------------------- |
|   group    |       string       | Task group name.                                                                                                  |
|   prefix   | boolean or string  | if false, no prefix for taskName. if true, group is used as prefix. if string, it becoms the prefix.              |
|    src     |       globs        | Source for build operation. The same parameter as gulp.src(). Referenced by bs.src().                             |
|   order    | string or string[] | Input file(src) ordering. Uses `gulp-order3` plugin. Referenced by bs.src().                                      |
|    dest    | string or function | Output(destination) directory of the build operation. The same parameter as gulp.dest(). Referenced by bs.dest(). |
| sourcemaps |      boolean       | If true, enables sourcemaps support. Referenced by bs.dest().                                                     |

And Cleaner options, Watcher opotions, and Log options can also be specified in TaskConfig.

**Log Options**
| opotion | type | description |
|:-----:|:-----:|-----|
logLevel?: 'verbose' | 'normal' | 'silent',
logger?: (...args: any[]) => void

### Cleaner Options

## BuildStream

BuildStream is a wrapper class for gulp stream object returned by gulp.src() function
with addition API to make gulp programming easier. It is not exactly the gulp stream,
but it can be used for most gulp operations.

Currently following API is provided. Refer to [BuildStream](./docs/02-BuildStream.md) for more details.

**BuildStream API**
| name | descrption |
|:-----:|-----|
| name | Property: TaskConfig name |
| className | Property: class name of the instance, 'BuildStream' |
| stream | Property: stream instance created by gulp.src(). |
| promiseSync | Propery: Internal promise instance handling sequencial sync operations. |
| opts | Property: TaskConfig object connected to this BuildStream instance. |
| bs.src() | Create source stream, like gulp.src(). |
| addSrc() | Add files to current stream. |
| order() | Sort the input file stream, using [`gulp-order3`](https://github.com/shnam7/gulp-order3) |
| changed() | Filters out unchanged files from the stream. |
| dest() | Write stream to the destination folder. |
| on() | Add event handler to the stream. |
| promise() | Add promise to be traced before the build process finishes. |
| then() | Add a function to be executed when all the promises in the build process fulfilled. |
| pipe() | Pipe streams. Use to chain plugins in the build process. |
| filter() | Filters the files in the stream using [`gulp-filter`](https://github.com/sindresorhus/gulp-filter) plugin. |
| rename() | Rename the file in the stream using [`gulp-rename`](https://github.com/hparra/gulp-rename). |
| copy() | Copy files. Support baych operations. |
| del() | Delete files using [`del`](https://github.com/sindresorhus/del). |
| clean() | Delete clean target specified in `conf.clean` |
| exec() | Execute external command using shell. |
| reload() | Reload browser-sync if it is enabled. |
| clear() | Remove all the files from the stream. |
| debug() | Print debug message using [`gulp-debug`](https://github.com/sindresorhus/gulp-debug). |
| intercept() | Add a function to be modify the contents of the stream.. |
| peek() | Add a function to monitor the contents of the stream. |
| log() | Print log message with task name prefixed. |
| logger | A property giving access to internal log function. |

## Plugins

Gulp-Tron Plugin is a function returning a PluginFunction. The PluginFunction
can be chained to build process using bs.pipe().

```ts
export type PluginFunction = (bs: BuildStream) => void
```

Example:

```ts
// define a plugin: function returning a BuildStream function.
const hello = msg => bs => {
    console.log(`${bs.name}:${msg}: custom plugin is running`)
}

// use the plugin
const build1 = {
    name: 'build1',
    build: bs => bs.pipe(hello('Hello!')),
}
```

For more examples, refer to:

-   [@gulp-tron/plugin-scripts](./packages/plugin-scripts/)
-   [@gulp-tron/plugin-styles](./packages/plugin-styles/)
-   [@gulp-tron/plugin-utils](./packages/plugin-utils/)

## Notes

### encoding

Gulp 5 uses streamx with encoding enabled by default. This is usally fine with
text file processing, but it causes file size bloating with binaray files such
as images. For better compatibility with previous versions, `gulp-tron` disables
the encoding by default.

To enable it, set the `encoding` property when calling bs.src().

```ts
const build1 = {
    name: 'build1`,
    build:bs => { bs.src({encoding:'utf8'}) }
}
```

### gulp instance

Sometimes, you may need gulp instance to directly access the gulp funtions.
In that case, you can import it from `gulp-trom`.

```ts
import tron, {gulp} from 'gulp-tron'
```

In contrary, if you want to set gulp instance to tron, then use `tron.use()` function.

```ts
import tron from 'gulp-tron'
import gulp from 'gulp'

tron.use(gulp)
```

If you experience a situation that gulp tasks are not created without error,
then try this.

## More Information

-   [Tron](./docs/01-Tron.md)
-   [BuildStream](./docs/02-BuildStream.md)

Check **[examples](./examples/)** for more examples.

## License

Copyright© 2024, Under MIT
