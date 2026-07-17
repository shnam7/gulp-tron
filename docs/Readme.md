# Tron (gulp-tron)

Tron is an advanced build system built on top of Gulp, providing robust task management, stream-based build operations, and modern developer ergonomics. It is designed for scalable, maintainable, and highly customizable build pipelines.

## Features

- Task registration and management (`task`, `createTasks`)
- Task dependencies and triggers (`dependsOn`, `triggers`)
- Automatic cleaner task creation (`addCleaner`)
- File change detection and auto execution (`addWatcher`)
- Task selection and pattern matching (`selectTasks`)
- Gulp series/parallel wrappers (`series`, `parallel`)
- Stream-based build operations via `BuildStream`
- Utility functions for copying, executing commands, glob pattern handling, and more

## Getting Started

Install Tron and its peer dependencies:

```bash
npm install gulp-tron gulp
```

## Basic Usage

```ts
import { Tron } from "gulp-tron";
const tron = new Tron();

tron.task("build", (bs) => bs.src("src/**/*.js").pipe(/* ... */).dest("dist/js"));
tron.addCleaner({ clean: ["dist"] });
tron.addWatcher();
// register multiple tasks at once
tron.createTasks({ name: "a", build: (bs) => bs.src("a") }, { name: "b", build: (bs) => bs.src("b") });
```

## API Overview

### Main Classes & Functions (see `src/` directory)

### Main Classes & Functions (see `src/` directory)

- **Tron**: Main class for task management and build orchestration ([src/tron.ts](../src/tron.ts))
- **BuildStream**: Stream-based build API ([src/build-stream.ts](../src/build-stream.ts))
- **series, parallel**: Gulp task composition helpers ([src/tron.ts](../src/tron.ts))

### Utilities (from `src/utils`)

- `arrayify` — utility for normalizing values to arrays ([src/utils/arrayify.ts](../src/utils/arrayify.ts))
- `copy` — multi-source copy helper ([src/utils/copy.ts](../src/utils/copy.ts))
- `exec` — command execution helper ([src/utils/exec.ts](../src/utils/exec.ts))
- Additional helpers exported from [src/utils/index.ts](../src/utils/index.ts): `flushAllStdio`, `timer`, `delay`, and the re-exported `is` helper from `@wicle/is`.

### Additional Helpers & Constants

- `isTaskConfig()` — type guard for task config objects
- `isValidTaskName()` — validates task names against reserved characters
- `anonymousTaskName` — default name assigned to anonymous build functions

### Example: Custom Task

```ts
tron.task("styles", (bs) => bs.src("src/**/*.scss").pipe(/* Sass plugin */).pipe(/* PostCSS plugin */).dest("dist/css"));
```

### Example: Cleaner & Watcher

```ts
tron.addCleaner({ clean: ["dist", "build"] });
tron.addWatcher({ browserSync: { server: "public" } });
```

## Advanced Usage

- Use `selectTasks` for pattern-based task selection
- Compose tasks with `series` and `parallel`
- Extend `BuildStream` for custom stream logic
- Integrate with Gulp plugins and your own utilities

## Documentation

- [Tron Class Documentation](./01-Tron.md)
- [BuildStream Class Documentation](./01-BuildStream.md)

See the `src/` directory for full source code and API details.

## License

MIT
