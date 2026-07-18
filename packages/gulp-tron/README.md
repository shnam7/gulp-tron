# Gulp-Tron

Easy-to-use, configuration-based gulp build manager. Users can create gulp tasks with simple configurations while defining build functions as part of the configuration.

## Features

- Quick and easy gulp task creation using configuration.
- Convenient BuildStream API to help define build process.
- Easy to add clean and watch tasks with minimal effort.
- BrowserSync support in the build configuration.
- Easy plugin support to develop and share build actions.
- Tested with gulp 5 and its stream-based task flow.

## Installation

```bash
npm i --save-dev gulp gulp-tron

# or
yarn add -D gulp gulp-tron

# or
pnpm add -D gulp gulp-tron
```

gulp is required as peer dependency to run gulp-tron.

## Quick example: gulpfile.js

```js
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import tron from "gulp-tron";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import babelG from "gulp-babel";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.relative(process.cwd(), __dirname);
const srcRoot = path.join(basePath, "assets");
const destRoot = path.join(basePath, "www");
const sassG = gulpSass(dartSass);

// --- styles
const scss = {
  name: "scss",
  build: (bs) => bs.log(`<scss:build>`).src().pipe(sassG().on("error", sassG.logError)).dest(),

  src: path.join(srcRoot, "scss/**/*.scss"),
  dest: path.join(destRoot, "css"),
};

// --- scripts
const scripts = {
  name: "scripts",
  build: (bs) => bs.log(`<scripts:build>`).src().pipe(babelG()).dest(),

  src: path.join(srcRoot, "js/**/*.js"),
  dest: path.join(destRoot, "js"),
};

// --- main
const build = {
  name: "@build",
  triggers: tron.parallel(scss, scripts),
  clean: path.join(destRoot, "{css,js}"),
};

tron
  .task(build)
  .addCleaner()
  .addWatcher({
    watch: path.join(destRoot, "**/*.html"),
    browserSync: { server: destRoot },
  });
```

You can inspect the generated tasks with the `gulp --tasks` command:

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

- `scss` and `scripts` tasks are created.
- `@build` task has two parallel tasks: `scss:main` and `scripts:main`
- `@clean` and `@watch` tasks are also created.
- `@clean` task captures all `conf.clean` properties as clean targets automatically.
- `@watch` task captures watch patterns from the selected task configs automatically.
- `bs` is an instance of `BuildStream` created for the task execution.
- `scss:main` and `scripts:main` are generated display names for the underlying task definitions.

## Tron

```ts
import tron from "gulp-tron";
```

tron is an instance of Tron, the gulp task manager. It can create tasks
with dependency hierarchy based on TaskConfig settings.

`Tron` provides the following API.
Refer to [Tron](./docs/01-Tron.md) for more details.

## TaskConfig

Configuration for a build task. Each task config maps to a gulp task and requires a **name** property, with many optional properties for behavior and execution.

```ts
const conf = {
    name: 'taskName'
    ...
}

tron.task(conf)
```

### conf.name

```ts
readonly name: string
```

Name of the `TaskConfig` instance. It becomes the gulp task name that is created.
This property is mandatory.

### conf.build

The main build function of type `BuildFunction`. This is effectively the body of the gulp task.

```ts
export type BuildFunction = (bs: BuildStream) => Promise<unknown> | undefined;
```

When the gulp task is executed, a `BuildStream` instance associated with the task config is created and passed to the `conf.build` function as the first argument.

If not specified, a no-op function is used.

### conf.dependsOn

```ts
readonly dependsOn?: BuildSet
```

BuildSet entries are executed **before** the main build function, `conf.build`.
A `BuildSet` can be a task name, a build function, a `TaskConfig` object, or a set built with `tron.series()` / `tron.parallel()`.

It can be of the following:

- task name - `conf.name` of other TaskConfig object.
- BuildFunction - anonymous task created on the fly.
- TaskConfig object
- BuildSetSeries - return value of tron.series(), or an array of `BuildSet`.
- BuildSetParallel - return value of tron.parallel()

**BuildSet Examples**

```ts
import tron from "gulp-tron";
import gulp from "gulp";

const build1 = { name: "build1" };
const build2 = { name: "build2", build: (bs) => console.log(`${bs.name} executed`) };
function buildFunc(bs) {
  bs.log("gulpTaskFunc: Hello, Lake!");
}

gulp.task("nativeGulpTask", (done) => done());

const set01 = [build1]; // series of single task. Same as build1
const set02 = [build1, build2, buildFunc, "nativeGulpTask"]; // series
const set03 = tron.parallel(build1, build2);
const set04 = tron.series(build1, build2);
const set05 = [build1, build2]; // serial set, the same as set04
const set06 = tron.parallel(set01, set02, set03, set04, set05);

tron.createTasks({
  name: "@build",
  dependsOn: set06,
});
```

### conf.triggers

```ts
readonly triggers?: BuildSet
```

This behaves like `conf.dependsOn`, except the referenced tasks are executed **after** the main build function.

### BuildOptions

`TaskConfig` can have additional optional properties.

|    name    |                type                | description                                                               |
| :--------: | :--------------------------------: | ------------------------------------------------------------------------- |
|    src     |         string or string[]         | Source in glob patterns for build operation respected by `bs.src()`       |
|   order    |         string or string[]         | Source file ordering respected by `bs.src()`                              |
|    dest    | string or ((file: File) => string) | Output destination path for the build operation respected by `bs.dest()`. |
| sourcemaps |              boolean               | If true, enables sourcemaps support. Referenced by `bs.dest()`.           |

Cleaner options, Watcher options, and Log options can also be specified in `TaskConfig`.

### Cleaner Options

|  name   |        type        | description                                                          |
| :-----: | :----------------: | -------------------------------------------------------------------- |
|  name?  |       string       | Cleaner task name. default value is '@clean'.                        |
| target? | string or string[] | Task name selectors in glob patterns to look for `clean` properties. |
| clean?  | string or string[] | Additional clean list.                                               |

Cleaner options can also include `LogOptions` and the options accepted by `deleteSync()` from [`del`](https://github.com/sindresorhus/del).

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

BuildStream is a wrapper class for gulp streams with methods such as `src`, `add`, `remove`, `filter`, `rename`, `order`, `changed`, `copy`, `del`, `clean`, `exec`, `dest`, `reload`, `clear`, `clone`, `chain`, `pipe`, and `debug`.
Refer to [BuildStream](./docs/02-BuildStream.md) for more details about the available API.

## Plugin

Gulp-Tron plugins are functions that receive a `BuildStream` instance and can be chained using `bs.chain()`.

```ts
export type PluginFunction = (bs: BuildStream) => void;
```

Example:

```ts
// define a plugin: function returning a BuildStream function.
const hello = (msg) => (bs) => {
  bs.log(`${msg}: custom plugin is running`);
};

// use the plugin
const build1 = {
  name: "build1",
  build: (bs) => bs.chain(hello("Hello!")),
};
```

## Notes

### encoding

Gulp 5 uses streamx with encoding enabled by default. This is usually fine for
text file processing, but it causes file size bloating with binary files such
as images. For better compatibility with previous versions, `Gulp-Tron` disables
the encoding by default.

To enable it, set the `encoding` property when calling `bs.src()`.

```ts
const build1 = {
  name: "build1",
  build: (bs) => {
    bs.src({ encoding: "utf8" });
  },
};
```

### gulp instance

Sometimes, you may need the gulp instance directly to access gulp functions.
In that case, you can import `gulp` from the package.

```ts
import tron, { gulp } from "gulp-tron";
```

If you need to use a specific gulp instance, you can import `gulp` from the package and use it directly.

```ts
import tron from "gulp-tron";
import gulp from "gulp";
```

If you run into a situation where gulp tasks are not created as expected, verify that your task configs are valid and that the package is built correctly.

## More Information

- [Tron](./docs/01-Tron.md)
- [BuildStream](./docs/02-BuildStream.md)

Check **[examples](./examples/)** for more examples.

## License

Copyright© 2024, Under MIT
