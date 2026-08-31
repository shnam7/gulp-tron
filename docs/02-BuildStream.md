# BuildStream Class

## Overview

`BuildStream` is a core utility used by [`Tron`](./01-Tron.md) to implement build tasks. It wraps gulp streams and provides a fluent, task-friendly API for source selection, file processing, destination output, cleanup, command execution, and stream lifecycle management.

In practice, `BuildStream` instances are created by `Tron` task manager and passed into task build functions, but the class can also be instantiated directly for advanced uses.

## Public Properties

- `name: string` — The task name or instance name.
- `className: string` — The name of the class (`BuildStream`).
- `opts: BuildOptions` — Task configuration options passed to the stream.
- `stream: GulpStream` — The underlying gulp/Node stream.

- `logger: Logger` — A leveled logger bound to this stream (from [`@wicle/tiny-logger`](https://www.npmjs.com/package/@wicle/tiny-logger); has `trace`/`debug`/`verbose`/`info`/`warn`/`error`/`fatal` methods, not a single callback). Defaults to a logger prefixed with `[name]`; pass `opts.logger` to supply your own.
- `performance: object` — Runtime metrics including `startTime` and `elapsedTime`, returned by the getter.

## Constructor

```ts
new BuildStream(name?: string, opts?: BuildOptions, stream?: GulpStream, promiseQ?: Promise<unknown>)
```

- `name` (optional): task or instance name.
- `opts` (optional): build options such as `src`, `dest`, `order`, `sourcemaps`, `clean`, `logger`, and `logLevel`.
- `stream` (optional): custom underlying stream.
- `promiseQ` (optional, advanced): a starting promise to seed the internal async queue — mainly for internal/testing use.

## Core Stream Methods

### `src(globsOrOptions?, options?)`

Starts the build stream by selecting source files.

- `globsOrOptions`: source files, either a glob string or array of glob strings, or a `SrcOptions` object that may include `src`, `base`, `since`, `read`, and other gulp source options.
- `options`: optional `SrcOptions` that override any values in `globsOrOptions` or the configured `opts.src`.

If `globsOrOptions` is omitted, `BuildStream` uses `opts.src` from the task configuration.

The method also honors `opts.sourcemaps` and sets `encoding: false` by default for binary-safe gulp 4 handling.

### `add(globs, options?)`

Appends additional source files to the existing stream.

- `globs`: file glob string or array of glob strings to add.
- `options`: optional `SrcOptions` for the added source files.

If `src()` has not been called yet, this method behaves like `src(globs, options)`.

### `remove(patterns)`

Removes matching files from the current stream.

- `patterns`: single glob string or array of glob strings.

Negative glob patterns are supported and automatically normalized so excluded files are removed from the stream.

### `filter(...args)`

Applies `gulp-filter` to the stream.

- `args[0]`: glob pattern, array of glob patterns, or a predicate function.
- `args[1]`: optional filter options such as `restore` or `passthrough`.

If only negation patterns are provided, a wildcard is injected so the filter is still applied correctly.

### `rename(...args)`

Applies `gulp-rename` to the stream.

- Accepts the same arguments as `gulp-rename`.
- Supports a rename string, an options object, or a callback function to compute new file names.

### `order(...args)`

Orders files in the stream using `gulp-order3`.

- `args[0]`: glob pattern or array of glob patterns defining the desired file order.
- `args[1]`: optional options object for `gulp-order3`.

If no patterns are provided, it uses `opts.order` from the task configuration.

### `changed(dest?, options?)`

Filters the stream to only changed files compared to the destination.

- `dest`: optional destination folder path to compare against. If omitted, defaults to `opts.dest`.
- `options`: optional `gulp-changed` options such as `hasChanged`, `extension`, or `debug`.

Uses a custom compare function that checks last modified time first and then file contents for more reliable change detection.

### `copy(globs, destPath, opts?)`

Copies files from source to destination.

- `globs`: source glob or array of globs to copy.
- `destPath`: destination folder path.
- `opts`: optional `CopyOptions` for the copy operation.

### `copy(params, opts?)`

Supports multiple `CopyParam` entries for mapping sources to destinations.

- `params`: a `CopyParam` object or array of `CopyParam`, each with a `src` glob, a `dest` path, and an optional per-param `options` override.
- `opts`: optional `CopyOptions`, passed as `copy-changed`'s `defaultOptions` and merged into every param — but each param's own `options` field wins over it.

`copy()` is a thin wrapper: it forwards directly to [`copy-changed`](https://www.npmjs.com/package/copy-changed)'s `copyChangedAsync()` and queues the result on the promise queue. See [Copy utility types](./04-Types.md#copy-utility-types) for the full `CopyOptions` shape (including the `onCopy`/`onSkip`/`onFinish` hooks).

### `del(patterns, options?)`

Deletes files or folders synchronously using `del`.

- `patterns`: glob string or array of glob strings to delete.
- `options`: optional `DelOptions` such as `force`, `cwd`, `dryRun`, `logger`, and `logLevel`.

### `clean(cleanExtra?, options?)`

Deletes configured clean targets.

- `cleanExtra`: additional glob or array of globs to clean beyond `opts.clean`.
- `options`: optional `CleanOptions` including `logger`/`logLevel` and nested `delOptions`.

Combines `opts.clean` and `cleanExtra`, logs its own `cleaning:[...]` message (also unconditionally — see the note below), then delegates to `del()` while swapping in `getSilentLogger()` as the logger, so `del()`'s own `deleting:[...]` line doesn't also print.

### `exec(command, options?)`

Executes a shell command and adds the result to the promise queue.

- `command`: shell command string to execute.
- `options`: optional `child_process.ExecSyncOptions` for command execution.

Runs the command via `child_process.exec()` (despite the `ExecSyncOptions` type name, it's the callback-based, non-blocking `exec`). Logs the command line up front, then either the captured stdout and a `verbose`-level "--> done." message on success, or an `error`-level failure message plus stderr on failure. None of this is gated by `options.logLevel` — this instance method uses `this.logger` throughout, so suppressing it relies on the logger's own level filtering (see the note below), not on anything passed to `exec()` itself. The result is queued so later `sync()` or `finish()` waits for command completion.

This is a different API from the standalone `exec()` utility function — see [Exec utility types](./04-Types.md#exec-utility-types) for that distinction.

### `dest(folder?, options?)`

Writes the stream to a destination folder using `gulp.dest()`.

- `folder`: optional destination folder path. If omitted, uses `this.opts.dest` or `"."`.
- `options`: optional destination options, including `sourcemaps`.

If `options.sourcemaps` is not provided, it falls back to `this.opts.sourcemaps`.

### `reload(options?)`

Reloads BrowserSync if it is active.

- `options`: optional BrowserSync stream options for reload behavior.

When BrowserSync is active, it pipes the current stream through `browserSync.stream(options)`.

### `clear()`

Removes all files from the stream by piping through an empty transform.

### `clone(name?)`

Clones the current stream and returns a new `BuildStream` instance.

- `name`: optional name for the cloned stream instance.

Useful for branching a build pipeline without consuming the original stream.

### `on(...args)`

Attaches event listeners to the underlying stream.

- `args[0]`: event name such as `finish`, `error`, or `data`.
- `args[1]`: listener callback.

Returns the current `BuildStream` instance.

### `promise(func | promise)`

Adds an async action to the promise queue.

- `func`: a synchronous or async callback returning a value or promise.
- `promise`: an existing `Promise`.

The queue guarantees each async action runs in order.

### `chain(func)`

Chains a plugin-style function to the build stream.

- `func`: callback that receives the current `BuildStream` instance.

This is useful for executing custom build logic while preserving fluent chaining.

### `pipe(plugin, options?)`

Pipes a plugin or transform into the stream.

- `plugin`: a gulp plugin stream or Node transform stream.
- `options`: optional pipe options such as `{ end?: boolean }`.

### `debug(title?: string, options?: DebugOptions): this`

Applies `gulp-debug2` to the stream and prints debug information.

- `title`: optional title prefix for debug output.
- `options`: optional `DebugOptions` for gulp-debug2.

Returns the current `BuildStream` instance for fluent chaining.

### `debug(options?: DebugOptions): this`

Applies `gulp-debug2` to the stream and prints debug information.

- `options`: optional `DebugOptions` for gulp-debug2.

Returns the current `BuildStream` instance for fluent chaining.

### `through(transform?, flush?, options?)`

Inserts a custom transform stream into the pipeline.

- `transform`: function called for each file in the stream.
- `flush`: optional function called when the stream ends.
- `options`: optional stream transform options.

### `intercept(interceptFunc?, onFinish?)`

Adds a transform that can modify or inspect each file in the stream.

- `interceptFunc`: function called for each file, with `(file, enc, cb)` parameters.
- `onFinish`: optional callback fired once when the stream finishes processing files.

### `peek(peekFunc?, onFinish?)`

Alias for `intercept()` that is useful for read-only inspection of each file.

- `peekFunc`: function called for each file with the file object.
- `onFinish`: optional callback fired after all files are processed.

## Build Completion Methods

### `sync()`

Waits for queued async actions to resolve and flushes stdio.

This ensures any async jobs added via `promise()` or `exec()` are complete before proceeding.

### `finish()`

Waits for both the promise queue and the stream `finish` event.

This ensures the current stream has fully completed and all queued async actions are finished.

- Use `finish()` when the task should not end until both stream output and async tasks are done.

### `log(...args)`

Logs messages prefixed with the stream name.

- `args`: values to log, similar to `console.log`.

Uses `this.logger.info(...)` — either `opts.logger` if you supplied one, or the default `[name]`-prefixed logger.

### `detachStream()`

Detaches the current underlying stream and resets the instance to a null stream.

- Returns the detached `GulpStream`.

The `BuildStream` instance can continue to be reused after detaching.

## Static Methods

- `BuildStream.nullStream(): Transform` — Returns a pass-through transform stream that emits no files. Used internally as the default underlying stream, and useful as a placeholder in tests.
- `BuildStream.through(transform?, flush?, options?): Transform` — Creates a standalone transform stream, independent of any `BuildStream` instance. The instance method `through()` above uses this internally.
- `BuildStream.main(bs, buildFunc): Promise<GulpStream>` — Runs a task's `build` function against a `BuildStream` instance and resolves once the resulting stream (and any queued async work) has finished. This is what `Tron` uses internally to run each task's `build` function; you generally won't call it directly unless building custom task-execution logic.

## Example

```ts
import { BuildStream } from "gulp-tron";

const bs = new BuildStream("build-js", {
  src: "src/**/*.js",
  dest: "dist/js",
});

bs.src().pipe(/* transform stream */).dest().log("build complete");
```

## Notes

- `BuildStream` is designed to work with Tron class, but can also be used directly for manual stream management.
- For task-level behavior and setup, see the [Tron class documentation](./01-Tron.md).

### Notes on `logLevel` vs. a silent logger

`options.logLevel` (part of `LogOptions`) is only actually checked by code in a couple of places — e.g. the standalone `exec()` utility, and `copy()` (delegated to `copy-changed`). Elsewhere — `del()`, `clean()`, and `BuildStream.exec()`'s own instance-level logging — the code always calls `logger.info()`/`.error()`/`.verbose()` unconditionally. Suppression in those cases comes entirely from the *logger instance itself* filtering by level:

- Construct the `BuildStream` (or pass per-call `options.logger`) with a genuinely silent logger, e.g. `getSilentLogger()` from `@wicle/tiny-logger`.
- Or construct it with `logLevel: "silent"` in `opts` — this sets the *default logger's* own `.level`, so its methods no-op internally. This only works with the real, pino-backed default logger; a hand-rolled mock/stub logger has no built-in level filtering of its own, so passing `logLevel: "silent"` alongside a plain mock logger will not suppress anything.
