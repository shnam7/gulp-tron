# gulp-tron (monorepo)

gulp-tron is a configuration-driven Gulp task manager built around a fluent `BuildStream` API and a `Tron` task registry. It helps you define build pipelines with task configs, dependency graphs, cleaner/watcher helpers, and plugin-friendly stream composition.

## Features

- Declarative task creation with `TaskConfig`
- Fluent stream operations via `BuildStream`
- Task grouping with `tron.series()` and `tron.parallel()`
- Auto-generated cleaner and watcher tasks
- BrowserSync integration for watch workflows
- Plugin-oriented architecture for reusable build steps

## Repository structure

- `packages/gulp-tron` — core package
- `packages/plugin-scripts` — script-related plugins (e.g. babel, coffee, concat, eslint, terser)
- `packages/plugin-styles` — style-related plugins (e.g. sass, less, postcss, autoprefixer, stylelint)
- `packages/plugin-utils` — utility plugins (e.g. data)
- `docs/` — package documentation

> The root `package.json` also reserves `apps/*` and `examples/*` workspace globs for future use, but neither directory currently exists in this repository.

## Installation

Install the core package:

```bash
npm install --save-dev gulp gulp-tron
```

Or with Bun:

```bash
bun add -D gulp gulp-tron
```

## Quick start

```js
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import tron from "gulp-tron";
import babelG from "gulp-babel";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "src");
const destRoot = path.join(__dirname, "dist");

// simple task
tron.task({
  name: "statics",
  src: path.join(srcRoot, "public/**"),
  dest: destRoot,
  build: (bs) => bs.src().dest(),
});

// build scripts with babel
const scripts = {
  name: "scripts",
  build(bs) {
    return bs.src().debug("src").pipe(babelG()).debug("dest").dest();
  },
  src: path.join(srcRoot, "js/**/*.js"),
  dest: path.join(destRoot, "js"),
};
tron.task(scripts);
```

See [Getting Started](docs/00-Getting%20started.md) for a more complete example with cleaner/watcher tasks and BrowserSync.

## Development

This is a [Turborepo](https://turborepo.com/) monorepo managed with [Bun](https://bun.sh/) workspaces.

From the repository root:

```bash
bun install
bun run build
bun run test
```

Useful workspace scripts (see the root `package.json` for the full list):

```bash
bun run build:tron      # build only the core gulp-tron package
bun run build:pkg       # build gulp-tron + all @gulp-tron/plugin-* packages
bun run test:tron       # run tests for gulp-tron only
bun run test:pkg        # run tests for gulp-tron + all @gulp-tron/plugin-* packages
bun run lint            # lint everything
bun run clean           # clean build output across the workspace
bun run reset           # clean, then remove .turbo and node_modules everywhere
bun run prepare-to-commit  # lint, build, test, clean — run before committing
```

## Documentation

- [Getting Started](docs/00-Getting%20started.md)
- [Core package README](packages/gulp-tron/README.md)
- [Tron docs](docs/01-Tron.md)
- [BuildStream docs](docs/02-BuildStream.md)
- [Type reference](docs/04-Types.md)

## License

MIT
