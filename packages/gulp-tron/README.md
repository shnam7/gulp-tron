# gulp-tron

[![npm package](https://img.shields.io/npm/v/gulp-tron.svg)](https://www.npmjs.com/package/gulp-tron) [![node compatibility](https://img.shields.io/node/v/gulp-tron.svg)](https://nodejs.org/en/about/previous-releases) [![build status](https://github.com/shnam7/gulp-tron/actions/workflows/ci.yml/badge.svg)](https://github.com/shnam7/gulp-tron/actions/workflows/ci.yml)

Easy-to-use, configuration-driven build manager for Gulp projects.

- Simple task creation through configuration
- Fluent API for manipulating build streams
- Dependency management for task execution
- Automatic generation of `@clean` and `@watch` tasks
- BrowserSync integration for watch workflows
- Plugin support for extending and reusing build processes

## Installation

You can use any package manager of your choice.
Here are some examples:

```bash
bun add -d gulp gulp-tron
# or
npm i --save-dev gulp gulp-tron
# or
pnpm add -D gulp gulp-tron
# or
yarn add -D gulp gulp-tron
```

`gulp` is a peer dependency and should be installed alongside `gulp-tron`.

## Quick example

```js
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

tron.task(scripts);
tron.task(build).addCleaner().addWatcher();
```

You can inspect the generated task list with:

```bash
npx gulp --tasks
```

Output:

```text
Tasks for ./gulpfile.js
├── scripts
├── @build
├── @clean
└── @watch
```

## Core concepts

### `Tron`

The `tron` instance manages tasks and builds dependency trees.

```ts
import tron from "gulp-tron";

tron.task({
  name: "build",
  src: "src/**/*.js",
  dest: "dist",
  build: (bs) => bs.src().dest(),
});
```

### `TaskConfig`

A task is generally described as a `TaskConfig` object:

```ts
const conf = {
  name: "scripts",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) => bs.src().dest(),
  dependsOn: ["shared"],
  triggers: ["notify"],
};
```

### `BuildStream`

A `BuildStream` instance is created for each task execution and provides fluent API such as:

- `src()` / `add()` / `remove()` / `filter()`
- `rename()` / `order()` / `changed()`
- `copy()` / `del()` / `clean()` / `exec()`
- `dest()` / `reload()` / `debug()` / `pipe()`

## API overview

### `Tron` methods

- `task()` — register a task by config or name
- `createTasks()` — register multiple tasks
- `addCleaner()` — create an auto-generated `@clean` task
- `addWatcher()` — create an auto-generated `@watch` task
- `series()` / `parallel()` — build task groups
- `selectTasks()` / `selectTasksAll()` / `findTask()` — task lookup helpers

### `BuildStream` methods

- `src()`, `add()`, `remove()`, `filter()`, `rename()`, `order()`
- `changed()`, `copy()`, `del()`, `clean()`, `exec()`
- `dest()`, `reload()`, `clear()`, `clone()`
- `promise()`, `chain()`, `pipe()`, `debug()`, `through()`
- `sync()`, `finish()`, `log()`

## Cleaner and watcher patterns

```js
tron
  .task({
    name: "styles",
    src: "src/**/*.scss",
    dest: "dist/css",
    build: (bs) => bs.src().pipe(/* sass plugin */).dest(),
    clean: "dist/css",
    watch: "src/**/*.scss",
  })
  .addCleaner()
  .addWatcher({
    browserSync: { server: "dist" },
  });
```

This creates:

- `styles` task
- `@clean` task from the task's `clean` property
- `@watch` task from the task's `watch` or `src` property

## Related docs

- [Getting Started](../../docs/00-Getting%20started.md)
- [Tron API](../../docs/01-Tron.md)
- [BuildStream API](../../docs/02-BuildStream.md)
- [Types Reference](../../docs/04-Types.md)

## License

MIT
