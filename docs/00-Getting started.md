# Getting Started

`Gulp-Tron` is a lightweight build manager on top of `gulp`. It simplifies task creation with configuration objects and provides a fluent `BuildStream` API for building files.

## Installation

```bash
npm install --save-dev gulp gulp-tron
```

Or with pnpm/yarn:

```bash
pnpm add -D gulp gulp-tron
# or
yarn add -D gulp gulp-tron
```

Or with bun:

```bash
bun add -d gulp gulp-tron
```

`gulp` is a peer dependency of `gulp-tron`, so it must be installed together.

## Key Concepts

- `Tron`: Task manager used to register and run build tasks.
- `TaskConfig`: Configuration object that defines task name, source, destination, build logic, and dependencies.
- `BuildStream`: Wrapper around gulp streams with fluent API such as `bs.src()`, `bs.dest()`, and `bs.pipe()`.

## Basic Example

Create a `gulpfile.js` like this:

```js
import tron from "gulp-tron";

tron.task("build", (bs) => {
  return bs.src("src/**/*.js").pipe(/* plugin */).dest("dist/js");
});
```

You can also define the same task using a `TaskConfig` object:

```js
tron.task({
  name: "build",
  src: "src/**/*.js",
  dest: "dist/js",
  build(bs) {
    return bs.pipe(/* plugin */);
  },
});
```

## Example from `examples/00-getting-started`

Below is a simplified version of `examples/00-getting-started/gulpfile.js`.

```js
import tron from "gulp-tron";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import babelG from "gulp-babel";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.relative(process.cwd(), __dirname);
const srcRoot = path.join(basePath, "src");
const destRoot = path.join(basePath, "dist");
const sassG = gulpSass(dartSass);

const statics = {
  name: "statics",
  src: path.join(srcRoot, "public/**"),
  dest: path.join(destRoot),
  build: (bs) => bs.log("<static:build>").src().dest(),
};

const scss = {
  name: "scss",
  src: path.join(srcRoot, "scss/**/*.scss"),
  dest: path.join(destRoot, "css"),
  build: (bs) => bs.log("<scss:build>").src().pipe(sassG().on("error", sassG.logError)).dest(),
};

const scripts = {
  name: "scripts",
  src: path.join(srcRoot, "js/**/*.js"),
  dest: path.join(destRoot, "js"),
  build: (bs) => bs.log("<scripts:build>").src().pipe(babelG()).dest(),
};

const build = {
  name: "@build",
  triggers: tron.parallel(statics, scss, scripts),
  clean: path.join(destRoot),
};

tron
  .task(build)
  .addCleaner()
  .addWatcher({
    watch: path.join(destRoot, "**/*.html"),
    browserSync: { server: destRoot },
  });
```

### What this example shows

- `statics`, `scss`, and `scripts` are individual task configurations.
- Each task defines `src`, `dest`, and `build` to compose a build pipeline.
- The `@build` task runs the three tasks in parallel using `triggers`.
- `addCleaner()` creates an `@clean` task that removes files from the configured `clean` targets.
- `addWatcher()` creates an `@watch` task that monitors source files and supports `browserSync`.

## Common commands

```bash
npx gulp --tasks   # show available gulp tasks
npx gulp @build    # run full build
npx gulp @clean    # run clean task
npx gulp @watch    # run watch task
```

## Understanding `BuildStream`

`BuildStream` wraps gulp streams and simplifies the build flow.

1. Use `bs.src(globs)` to select input files.
2. Use `.pipe(...)` to process files with plugins.
3. Use `bs.dest(dest)` to write output files.

It also provides helpers like `bs.copy()`, `bs.filter()`, and `bs.clean()`.

## Next steps

- Learn how to use Gulp-Tron with `task()`, `series()`, and `parallel()`.
- Explore `TaskConfig` options like `dependsOn`, `triggers`, `clean`, and `watch`.
- Use `addCleaner()` and `addWatcher()` to automate cleaning and watching.
- Check the `examples/` folder for real-world cases.

## Related documentation

- [Tron Class Documentation](./01-Tron.md)
- [BuildStream Class Documentation](./01-BuildStream.md)

---

For additional examples and details, explore the `examples/` directory.
