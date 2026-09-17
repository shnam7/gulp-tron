# BuildStream

`BuildStream` is the per-task stream pipeline used inside `gulp-tron`.

Each task build function receives a `BuildStream` instance as an argument. It wraps a gulp stream and adds convenience methods for source selection, stream transforms, output writing, cleanup, async coordination, and logging.

In short, `BuildStream` is the main API you use when implementing the actual work of a task.

## Essentials

### Constructor

```ts
new BuildStream(name?: string, opts?: BuildOptions, stream?: GulpStream, promiseQ?: Promise<unknown>);
```

Most users don't construct `BuildStream` directly - it's created automatically and passed to a task's `build` function.

- **name**: `string` (optional)
  Name for this instance, used as the logger's `[name]` prefix and returned by the `name` getter.
  - Default: `"<anonymous>"`

- **opts**: `BuildOptions` (optional)
  Task options this instance operates with (`src`, `dest`, `order`, `sourcemaps`, `logger`, `logLevel`, plus the cleaner/watcher fields). Stored and consulted later by methods such as `src()`, `dest()`, `order()`, and `clean()` when their own arguments are omitted.
  - Default: `{}`

- **stream**: `GulpStream` (optional)
  An existing stream to wrap instead of starting from a null stream.
  - Default: a null stream that is already ended, so a `finish` event still fires even if `src()` is never called

- **promiseQ**: `Promise<unknown>` (optional)
  An existing promise queue to continue from - used when one `BuildStream` is derived from another, e.g. `clone()`.
  - Default: `Promise.resolve()`

### Properties

- **name**: `string` (read-only)
  Task or instance name.

- **className**: `string` (read-only)
  Runtime class name of the instance, normally `"BuildStream"`.

- **stream**: `GulpStream` (read-only)
  The current underlying gulp/Node stream.

- **promiseQ**: `Promise<unknown>` (read-only)
  The current queued asynchronous work for this instance.

- **opts**: `BuildOptions` (read-only)
  A copy of the options this instance was constructed with.

- **logger**: `Logger` (read-only)
  The `@wicle/tiny-logger` logger instance used for this task's log output.

- **performance**: `{ startTime: number; elapsedTime: number }` (read-only)
  Timing metadata: `startTime` is when the instance was created; `elapsedTime` is recalculated on every access.

## Source & Stream Building

### src(globsOrOptions?, options?)

```ts
bs.src(globsOrOptions?: string | string[] | SrcOptions, options?: SrcOptions): this;
```

Starts (or restarts) the stream by calling `gulp.src()`, then applies `order()`.

- **globsOrOptions**: `string | string[] | SrcOptions` (optional)
  Either the glob pattern(s) to read, or an `SrcOptions` object to use together with the task's own `src` patterns.
  - Default: the task's `src` option

- **options**: `SrcOptions` (optional)
  Options for `gulp.src()`, merged over anything passed via `globsOrOptions`.
  - Default: `{}`

Notes: `sourcemaps` falls back to the task's `sourcemaps` option when not set in `options`, and `encoding` defaults to `false` for compatibility with binary files (e.g. images) under gulp 4.

```ts
bs.src();
bs.src("src/**/*.js");
bs.src({ read: false });
```

### add(globs, options?)

```ts
bs.add(globs: string | string[], options?: SrcOptions): this;
```

Appends more files to the current stream via `gulp.src()`, without discarding what's already there. If `src()` hasn't been called yet, this behaves the same as calling `src(globs, options)`.

- **globs**: `string | string[]`
  Glob pattern(s) to add to the stream.

- **options**: `SrcOptions` (optional)
  Options for `gulp.src()`.
  - Default: `{}`

```ts
bs.add("src/**/*.txt");
```

### remove(patterns?)

```ts
bs.remove(patterns?: string | string[]): this;
```

Removes files matching `patterns` from the stream. A thin wrapper around `filter()` with the patterns negated.

- **patterns**: `string | string[]` (optional)
  Glob pattern(s) to remove. A leading `!` is toggled, so an already-negated pattern is re-included instead.

```ts
bs.remove(["**/*.tmp", "!**/keep.tmp"]);
```

### filter(...args)

```ts
bs.filter(patterns: string | string[] | FilterFunction, options?: GulpFilterOptions): this;
```

Filters files in the stream using `gulp-filter`. See `gulp-filter`'s own docs for the full argument reference.

- **patterns**: `string | string[] | FilterFunction`
  Glob pattern(s), or a predicate function, selecting which files stay in the stream. A negation-only pattern list gets `"*"` prepended automatically.

- **options**: `GulpFilterOptions` (optional)
  Options forwarded to `gulp-filter`.

```ts
bs.filter("**/*.js");
```

### rename(...args)

```ts
bs.rename(...args: Parameters<typeof gulpRename>): this;
```

Renames files in the stream using `gulp-rename`. See `gulp-rename`'s own docs for the accepted argument forms.

- **args**: same arguments `gulp-rename` itself accepts - a string, an object of path parts, or a rename function.

```ts
bs.rename({ extname: ".mjs" });
```

### order(...args)

```ts
bs.order(patterns?: string | string[], options?: GulpOrderOptions): this;
```

Orders files in the stream using `gulp-order`.

- **patterns**: `string | string[]` (optional)
  Glob pattern(s) describing the desired order.
  - Default: the task's `order` option

- **options**: `GulpOrderOptions` (optional)
  Options forwarded to `gulp-order`.

```ts
bs.order(["**/vendor/*.js", "**/*.js"]);
```

### changed(dest?, options?)

```ts
bs.changed(dest?: string | ((file: File) => string), options?: GulpChangedOptions): this;
```

Filters out files that are unchanged compared to `dest`. A file is treated as changed only if its last-modified time looks different **and** its contents actually differ - this two-step check avoids false positives from files that were merely touched without being edited.

- **dest**: `string | ((file: File) => string)` (optional)
  Destination to compare against.
  - Default: the task's `dest` option. If neither is available, `changed()` is a no-op and the stream passes through unfiltered.

- **options**: `GulpChangedOptions` (optional)
  Options forwarded to `gulp-changed`. You can still pass your own `hasChanged` comparator to override the default two-step check.
  - Default: `{}`

```ts
bs.changed("dist");
```

## File System Operations

### copy(globs, destPath, opts?) / copy(params, opts?)

```ts
bs.copy(globs: string | string[], destPath: string, opts?: CopyOptions): this;
bs.copy(params: CopyParam | CopyParam[], opts?: CopyOptions): this;
```

Copies only changed files (by modification time and size) from source to destination, delegating to the `copy-changed` package. The copy runs asynchronously and is queued on this instance's promise queue, so a copy failure propagates and fails the build.

**`copy(globs, destPath, opts?)`**

- **globs**: `string | string[]`
  Source glob(s) to copy.

- **destPath**: `string`
  Destination path to copy into.

- **opts**: `CopyOptions` (optional)
  Options forwarded to `copy-changed` (e.g. `force`, `clearDest`, `dryRun`).
  - Default: `{}`

**`copy(params, opts?)`**

- **params**: `CopyParam | CopyParam[]`
  One or more `{ src, dest, options? }` copy tasks.

- **opts**: `CopyOptions` (optional)
  Shared defaults merged into every param's own `options` - a param's own `options` still wins where the two overlap. This is `copy-changed`'s own `defaultOptions` argument.
  - Default: `{}`

```ts
bs.copy("src/**/*.png", "dist/images");
```

### del(patterns, options?)

```ts
bs.del(patterns: string | string[], options?: DelOptions): this;
```

Deletes files and folders matching `patterns`, delegating to the `del` package. The delete runs asynchronously and is queued on this instance's promise queue.

- **patterns**: `string | string[]`
  Glob pattern(s) of files/folders to delete.

- **options**: `DelOptions` (optional)
  `del`'s own options (e.g. `force`, `dryRun`, `cwd`) plus `logger`/`logLevel`.
  - Default: `{}`

```ts
bs.del("dist/**");
```

### clean(cleanExtra?, options?)

```ts
bs.clean(cleanExtra?: string | string[], options?: CleanOptions): this;
```

Deletes the task's configured `clean` targets together with any extra patterns you pass, then delegates to `del()` - with `del()`'s own logging silenced, since `clean()` already logs its own summary line.

- **cleanExtra**: `string | string[]` (optional)
  Additional patterns to delete, on top of the task's own `clean` option.
  - Default: `[]`

- **options**: `CleanOptions` (optional)
  Passed through to the underlying `del()` call.
  - Default: `{}`

```ts
bs.clean("dist/tmp");
```

### exec(command, options?)

```ts
bs.exec(command: string, options?: child_process.ExecOptions): this;
```

Runs a shell command via Node's `child_process.exec()`, queued on this instance's promise queue. `stdout` is logged on success; on failure, `stderr` (if any) and `stdout` are logged and the error is re-thrown, failing the build.

- **command**: `string`
  Shell command to execute.

- **options**: `child_process.ExecOptions` (optional)
  Options forwarded to `child_process.exec()`.
  - Default: `{}`

```ts
bs.exec("npm run build");
```

### dest(folder?, options?)

```ts
bs.dest(folder?: string | ((file: File) => string), options?: DestOptions): this;
```

Writes the current stream to disk via `gulp.dest()`. Companion sourcemap files are held back just long enough to be released together with their main file, closing a race where a downstream step could otherwise read a `.map` file before it's fully written.

- **folder**: `string | ((file: File) => string)` (optional)
  Destination folder, or a function returning one per file.
  - Default: the task's `dest` option, or `"."` if that's also missing

- **options**: `DestOptions` (optional)
  Options forwarded to `gulp.dest()`. `sourcemaps` falls back to the task's `sourcemaps` option when not set here.
  - Default: `{}`

```ts
bs.dest("dist");
bs.dest();
```

## Live Reload & Debugging

### reload(options?)

```ts
bs.reload(options?: BrowserSyncStreamOptions): this;
```

Pipes the stream through BrowserSync's reload stream - but only when BrowserSync is actually active (`browserSync.active`), so it's safe to call even in setups that don't use BrowserSync at all.

- **options**: `BrowserSyncStreamOptions` (optional)
  Options forwarded to `browserSync.stream()`.
  - Default: `{}`

```ts
bs.reload();
```

### debug(title?, options?) / debug(options?)

```ts
bs.debug(title?: string, options?: DebugOptions): this;
bs.debug(options?: DebugOptions): this;
```

Inserts a `gulp-debug2` step into the pipeline, printing file paths as they pass through - useful for inspecting the pipeline during development.

- **title**: `string` (optional)
  Prefix shown before each debug line.
  - Default: `"debug:"`

- **options**: `DebugOptions` (optional)
  Options forwarded to `gulp-debug2`. If `options.logger` is omitted, output is routed through this instance's own logger at the `info` level.
  - Default: `{}`

```ts
bs.debug("after-build");
```

## Stream Lifecycle & Composition

### chain(func)

```ts
bs.chain(func: PluginFunction): this;
```

Runs a plugin-style function against this `BuildStream` instance - useful for grouping reusable pipeline steps.

- **func**: `PluginFunction`
  `(bs: BuildStream) => void`. Called immediately with this instance.

```ts
bs.chain((stream) => stream.log("custom step"));
```

### pipe(plugin, options?)

```ts
bs.pipe(plugin: GulpStream | Transform, options?: { end?: boolean }): this;
```

Pipes the current stream through a gulp/Node plugin stream.

- **plugin**: `GulpStream | Transform`
  The plugin stream to pipe through.

- **options**: `{ end?: boolean }` (optional)
  Whether to end the writable side of the stream when the readable side ends.

```ts
bs.pipe(myPlugin());
```

### through(transform?, flush?, options?)

```ts
bs.through(transform?: TransformFunction, flush?: FlushFunction, options?: TransformOptions): this;
```

Inserts an ad hoc transform stream into the pipeline, without needing a separate plugin package.

- **transform**: `TransformFunction` (optional)
  Called for each file passing through.

- **flush**: `FlushFunction` (optional)
  Called once after all files have passed through.

- **options**: `TransformOptions` (optional)
  Node stream `Transform` options (e.g. `objectMode`).

```ts
bs.through(transformFn);
```

### clear()

```ts
bs.clear(): this;
```

Removes all files currently in the stream, without ending it. Takes no arguments.

```ts
bs.clear();
```

### clone(name?)

```ts
bs.clone(name?: string): BuildStream;
```

Creates a new `BuildStream` that shares this instance's options and promise queue, with its own cloned copy of the current stream contents.

- **name**: `string` (optional)
  Name for the cloned instance.
  - Default: this instance's own name

```ts
const copyStream = bs.clone("copy");
```

## Events & Inspection Hooks

### on(...args)

```ts
bs.on(event: string, listener: (...args: unknown[]) => void): this;
```

Shortcut for `bs.stream.on()` - attaches an event listener directly to the underlying stream.

- **event**: `string`
  Event name (e.g. `"finish"`, `"data"`, `"error"`).

- **listener**: `(...args: unknown[]) => void`
  Handler invoked when the event fires.

```ts
bs.on("finish", () => console.log("done"));
```

### intercept(interceptFunc?, onFinish?)

```ts
bs.intercept(
  interceptFunc?: (file: Vinyl, enc: BufferEncoding, cb: TransformCallback) => void,
  onFinish?: (cb: TransformCallback) => void,
): this;
```

Adds a function that can inspect, mutate, or replace each file passing through the stream.

- **interceptFunc**: (optional)
  Called once per file; call `cb(error, file)` to continue (or `cb(error, null)` to drop the file).

- **onFinish**: (optional)
  Called once after all files have passed through; call `cb()` when done.

```ts
bs.intercept((file, enc, cb) => {
  file.contents = Buffer.from("...");
  cb(null, file);
});
```

### peek(peekFunc?, onFinish?)

```ts
bs.peek(peekFunc?: (file: Vinyl) => void, onFinish?: (cb: TransformCallback) => void): this;
```

A read-only variant of `intercept()` for lightweight inspection - files pass through unchanged.

- **peekFunc**: `(file: Vinyl) => void` (optional)
  Called once per file, for inspection only.

- **onFinish**: (optional)
  Called once after all files have passed through.

```ts
bs.peek((file) => console.log(file.relative));
```

## Async Coordination

### promise(func) / promise(promise)

```ts
bs.promise(func: () => unknown): this;
bs.promise(promise: Promise<unknown>): this;
```

Adds a function or a promise to this instance's internal promise queue, so it's awaited (in order) before the task is considered complete.

- **func**: `() => unknown`
  A function to queue. If it's an async function, it's awaited in place.

- **promise**: `Promise<unknown>`
  A promise to queue directly.

```ts
bs.promise(async () => {
  /* async work */
});
```

### sync()

```ts
bs.sync(): Promise<void>;
```

Awaits the internal promise queue, then flushes any buffered stdio output. Takes no arguments.

```ts
await bs.sync();
```

### finish()

```ts
bs.finish(): Promise<void>;
```

Waits for the underlying stream to emit `finish`, then calls `sync()` - use this when you need both the stream and all queued async work to have completed. Takes no arguments.

```ts
await bs.finish();
```

## Logging

### log(...args)

```ts
bs.log(...args: Parameters<typeof console.log>): this;
```

Logs a message via this instance's logger, at the `info` level.

- **args**: same arguments you'd pass to `console.log()`.

Note: the `[name]` prefix you see in the output comes from how the logger itself was created (see the constructor), not from `log()` - so calling `this.logger.info()`/`.error()` directly (as `copy()`, `del()`, and `clean()` do) produces the same prefix without going through `log()`.

```ts
bs.log("build finished");
```

## Example

```ts
tron.task({
  name: "scripts",
  src: "src/**/*.js",
  dest: "dist/js",
  build: (bs) => bs
    .src()
    .debug("src")
    .pipe(/* plugin */)
    .dest(),
});
```

## Advanced

### detachStream()

```ts
bs.detachStream(): GulpStream;
```

Detaches the current underlying stream from this instance and resets the instance to a fresh null stream. Takes no arguments.

The returned stream is no longer managed by this `BuildStream` instance, but the instance itself can be reused afterward.

```ts
const detached = bs.detachStream();
```

### `BuildStream.main(bs, buildFunc)` (static)

```ts
BuildStream.main(bs: BuildStream, buildFunc: BuildFunction): Promise<GulpStream>;
```

Runs a task's build function against `bs`, then waits for the stream to finish and for all of `bs`'s queued async work to settle. This is what `Tron` calls internally to execute a task's `build` function - most users won't call it directly.

- **bs**: `BuildStream`
  The instance to run the build function against.

- **buildFunc**: `BuildFunction`
  `(bs: BuildStream) => Promise<unknown> | undefined`. The task's build function.

`main` is the only static method on `BuildStream`. (An earlier version of this doc also listed a static `BuildStream.through()` - that method doesn't exist; the transform-stream functionality it described is the instance method [`through()`](#throughtransform-flush-options) above.)

### `logLevel` vs. a silent logger

`options.logLevel` is applied once, in the constructor, to set the logger's level - individual methods don't re-check it afterward. When a method needs to suppress a *nested* call's output regardless of level - for example, `clean()` silencing the `del()` call it makes internally - it does so by passing that call a genuinely silent logger, not by inspecting `logLevel`.

If you want to silence output intentionally, use a real silent logger (or a logger whose level is set to `"silent"`) rather than relying on a plain mock logger with no-op methods. This matters most when `copy()`, `del()`, or `clean()` need to log their own internal activity without adding noise to your task's output.

## Related docs

- [Getting Started](./00-Getting%20started.md)
- [Tron](./01-Tron.md)
- [Type Reference](./04-Types.md)
