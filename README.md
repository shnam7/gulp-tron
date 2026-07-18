# Gulp-Tron

Gulp-Tron is a configuration-driven Gulp task manager built around a fluent `BuildStream` API and a `Tron` task registry. It helps you define build pipelines with task configs, dependency graphs, cleaner/watcher helpers, and plugin-friendly stream composition.

## Features

- Declarative task creation with `TaskConfig`
- Fluent stream operations via `BuildStream`
- Task grouping with `tron.series()` and `tron.parallel()`
- Auto-generated cleaner and watcher tasks
- BrowserSync integration for watch workflows
- Plugin-oriented architecture for reusable build steps

## Repository structure

- `packages/gulp-tron` — core package
- `packages/plugin-scripts` — script-related plugins
- `packages/plugin-styles` — style-related plugins
- `packages/plugin-utils` — utility plugins
- `examples/` — runnable example projects
- `docs/` — package documentation

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

```ts
import tron from "gulp-tron";

tron.task({
  name: "build",
  src: "src/**/*.js",
  dest: "dist",
  build: (bs) => bs.src().dest(),
});
```

## Development

From the repository root:

```bash
bun install
bun run build
bun run test
```

Useful workspace scripts:

```bash
bun run build:core
bun run build:plugins
bun run test:core
bun run test:plugins
```

## Documentation

- [Core package README](packages/gulp-tron/README.md)
- [Type reference](docs/04-Types.md)
- [Tron docs](packages/gulp-tron/docs/01-Tron.md)
- [BuildStream docs](packages/gulp-tron/docs/02-BuildStream.md)

## License

MIT
