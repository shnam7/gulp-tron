# gulp-tron

Easy to use, configuration based gulp build manager. Users can create gulp tasks with simple configurations. At the same time, users can defien build function as part of the configuration.

## Features

-   Quick and easy gulp task creation using configuration.
-   Convenient BuildStream API to help define build process.
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

gulp is required as peer dependency to run gulp-tron.

## Quick example: gulpfile.js

```js
import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from '@gulp-tron/core'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babelG from 'gulp-babel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const sassG = gulpSass(dartSass)

// --- styles
const scss = {
    name: 'scss',
    build: bs => bs.log(`<scss:build>`).src().pipe(sassG().on('error', sassG.logError)).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

// --- scripts
const scripts = {
    name: 'scripts',
    build: bs => bs.log(`<scripts:build>`).src().pipe(babelG()).dest(),

    src: path.join(srcRoot, 'js/**/*.js'),
    dest: path.join(destRoot, 'js'),
}

// --- main
const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: path.join(destRoot, '{css,js}'),
}

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

-   `scss` and `scripts` tasks are created.
-   `@build` task has two parallel tasks: `scss:main` and `script:main`
-   `@clean` and `@watch` tasks are also created.
-   `@clean` task captures all the conf.clean properties as clean target automatically.
-   `@watch` task captures all the conf.src properties as watch target automatically.
-   `bs` is an instance of `BuildStream` automatically created by the gulp task.
-   `scss:main` and `script:main` are display names referring to `scss` and `scripts` tasks.

## Tron

```ts
import tron from '@gulp-tron/core'
```

tron is an instance of Tron, the gulp task manager. It can create tasks
with dependency hierarchy based on TaskConfig settings.

`Tron` provides following API.
Refer to [Tron](./docs/01-Tron.md) for more details.

## TaskConfig

Configuration to define build task. It has 1-to-1 connection to gulp task. It has one
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

Name of the TaskConfig instance. It becomses the gulp task name to be created.
This property is a mandatory.

### conf.build

The main build function of type `BuildFunction`. This is effectively the body of the gulp task.

```ts
export type BuildFunction = (bs: BuildStream) => void | Promise<any>
```

When the gulp task is executed, `BuildStream` instance connected to the this TaskConfig is created
and passed to the `conf.build` function as first argument.

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
import tron from '@gulp-tron/core'
import gulp from 'gulp'

const build1 = {name: 'build1'}
const build2 = {name: 'build2', build: bs => console.log(`${bs.name} executed`)}
function buildFunc(bs) {
    bs.log('gulpTaskFunc: Hello, Lake!')
}

gulp.task('nativeGulpTask', done => done())

const set01 = [build1] // series of single task. Same as build1
const set02 = [build1, build2, buildFunc, 'nativeGulpTask'] // series
const set03 = tron.parallel(build1, build2)
const set04 = tron.series(build1, build2)
const set05 = [build1, build2] // serial set, the same as set04
const set06 = tron.parallel(set01, set02, set03, set04, set05)

tron.createTask({
    name: '@build',
    dependsOn: set06,
})
```

### conf.triggers

```ts
readonly triggers?: BuildSet
```

The same as conf.dependsOn except that it is executed **after** main build function.

### BuildOptions

`TaskConfig` can have additional properties as option.

|    name    |        type        | description                                                                  |
| :--------: | :----------------: | ---------------------------------------------------------------------------- |
|    src     |       globs        | Source in glob patterns for build operation respected by bs.src()            |
|   order    | string or string[] | Source file ordering respected by bs.src()                                   |
|    dest    | string or function | Output(destination) directory of the build operation respected by bs.dest(). |
| sourcemaps |      boolean       | If true, enables sourcemaps support. Referenced by bs.dest().                |

And Cleaner options, Watcher opotions, Log options can also be specified in TaskConfig.

### Cleaner Options

|  name   |        type        | description                                                          |
| :-----: | :----------------: | -------------------------------------------------------------------- |
|  name?  |       string       | Cleaner task name. default value is '@clean'.                        |
| target? | string or string[] | Task name selectors in glob patterns to look for `clean` properties. |
| clean?  | string or string[] | Additional clean list.                                               |

Cleaner Options can also include LogOptions and options to deleteSync() from [`del`](https://github.com/sindresorhus/del).

### Watcher Options

|     name     |        type        | description                                                            |
| :----------: | :----------------: | ---------------------------------------------------------------------- |
|    name?     |       string       | Watcher task name. default value is '@watch'.                          |
|   target?    | string or string[] | Task name selectors in glob patterns to look for `watch` properties.   |
| browserSync? | browserSyncOptions | Options to [BrowserSync](https://github.com/Browsersync/browser-sync). |
|    watch?    | string or string[] | Override default watch, conf.src.                                      |
|  addWatch?   | string or string[] | Additional watch in addition to watch or default watch.                |

### Log Options

|   name    |   type   | description                         |
| :-------: | :------: | ----------------------------------- |
| logLevel? |  string  | : 'verbose' or 'normal' or 'silent' |
|  logger?  | function | `(...args: any[]) => void`          |

## BuildStream

BuildStream is a wrapper class for gulp stream with additional API to define build process.
Refer to [BuildStream](./docs/02-BuildStream.md) for more details including the API available.

## Plugin

Gulp-Tron Plugin is a function returning a PluginFunction, which can be chained using bs.chain().

```ts
export type PluginFunction = (bs: BuildStream) => void
```

Example:

```ts
// define a plugin: function returning a BuildStream function.
const hello = msg => bs => {
    bs.log(`${msg}: custom plugin is running`)
}

// use the plugin
const build1 = {
    name: 'build1',
    build: bs => bs.chain(hello('Hello!')),
}
```

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
In that case, you can get it from `gulp-trom`.

```ts
import tron, {gulp} from '@gulp-tron/core'
```

In contrary, if you want to set gulp instance to tron, then use `tron.use()` function.

```ts
import tron from '@gulp-tron/core'
import gulp from 'gulp'

tron.use(gulp)
```

If you experience a situation that gulp tasks are not created without error, then try this.

## More Information

-   [Tron](./docs/01-Tron.md)
-   [BuildStream](./docs/02-BuildStream.md)

Check **[examples](./examples/)** for more examples.

## License

Copyright© 2024, Under MIT
