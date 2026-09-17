# Getting Started

`gulp-tron` is a lightweight task manager built on top of gulp. It lets you describe build work with `TaskConfig` objects, register them with `Tron`, and run them through a fluent `BuildStream` API.

## Installation

You can use any package manager you prefer. For example:

```bash
bun add -D gulp gulp-tron
# or
npm install --save-dev gulp gulp-tron
# or
pnpm add -D gulp gulp-tron
# or
yarn add -D gulp gulp-tron
```

`gulp` is a peer dependency, so it should be installed alongside `gulp-tron`.

## Core concepts

- `Tron`: task registry and dependency manager
- `TaskConfig`: a task definition object with `name`, `src`, `dest`, `build`, and optional dependencies
- `BuildStream`: a per-task stream pipeline with helpers such as `src()`, `pipe()`, `dest()`, `clean()`, and `exec()`

## Minimal example

```js
import tron from "gulp-tron";

tron.task({
  name: "build",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) => bs.src().pipe(/* plugin */).dest(),
});
```

You can also register the same task by name and callback:

```js
tron.task("build", (bs) => bs.src("src/**/*.js").pipe(/* plugin */).dest("dist/js"));
```

## An example with multiple tasks and generated clean/watch tasks

```js
import tron from "gulp-tron";
import gulpBabel from "gulp-babel";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

const sassG = gulpSass(dartSass);

const scripts = {
  name: "scripts",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) =>bs.log("<scripts:build>").src().pipe(gulpBabel()).dest(),
};

const styles = {
  name: "styles",
  src: "src/**/*.scss",
  dest: "dist/css",
  build: (bs) => bs.log("<scss:build>").src().pipe(sassG().on("error", sassG.logError)).dest(),
};

const build = {
  name: "@build",
  triggers: tron.parallel(scripts, styles),
  clean: "dist",
};

tron.task(build).addCleaner().addWatcher();
```

This creates a build task and then generates default `clean` and `watch` tasks.
The `clean` and `watch` tasks automatically detect the relevant clean and watch targets by reading the `TaskConfig` metadata for all registered tasks.

## Common commands

```bash
npx gulp --tasks
npx gulp @build
npx gulp @clean
npx gulp @watch
```

## Typical workflow

1. Define task sources and destinations in a `TaskConfig`
2. Add a `build` function that uses `BuildStream`
3. Link tasks with `dependsOn` or `triggers`
4. Call `addCleaner()` and `addWatcher()` to generate helper tasks
5. Run the task tree from the gulp CLI

> Important: `@clean` and `@watch` are reserved task names used by Tron for clean and watch tasks. Avoid using those names for custom tasks unless you intentionally want to override the generated behavior.

## Related docs

- [Tron API](./01-Tron.md)
- [BuildStream API](./02-BuildStream.md)
- [Type Reference](./04-Types.md)
