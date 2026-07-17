# BuildStream Class Documentation

## Overview

The `BuildStream` class is a core utility for stream-based build operations in the Tron/Gulp-Tron ecosystem. It wraps and extends Node.js streams, providing a fluent API for file transformations, copying, cleaning, and more.

## Key Features

- Fluent API for stream operations
- Source and destination management (`src`, `dest`)
- File transformation and piping
- Cleaning (deletion) support

# BuildStream Class Documentation

## Overview

The `BuildStream` class is a core utility for stream-based build operations in the Tron/Gulp-Tron ecosystem. It wraps and extends Node.js streams, providing a fluent API for file transformations, copying, cleaning, and more.

## Public Properties

- `name`: string — The name of the BuildStream instance (usually the gulp task name)
- `className`: string — The class name of the instance
- `opts`: BuildOptions — The configuration/options for the stream
- `stream`: GulpStream — The underlying Node.js stream
- `promiseQ`: Promise<unknown> — Internal promise queue for async operations
- `logger`: (...args) => void — Logger function for this instance
- `performance`: object — Performance metrics (startTime, elapsedTime)

## Constructor

```ts
new BuildStream(name?: string, opts?: BuildOptions, stream?: GulpStream, promiseQ?: Promise<unknown>)
```

- `name`: string (optional)
- `opts`: BuildOptions (optional)
- `stream`: GulpStream (optional)
- `promiseQ`: Promise (optional)

## Public Methods

### src(globsOrOptions, options?)

Sets the source files for the stream. Accepts glob patterns or options.

- `globsOrOptions`: string | string[] | SrcOptions
- `options`: SrcOptions (optional)

### add(globs, options?)

Appends files to the current stream.

- `globs`: string | string[]
- `options`: SrcOptions (optional)

### remove(patterns)

Removes files from the build stream using glob patterns.

- `patterns`: string | string[]

### filter(patterns, options?)

Filters files in the stream using glob patterns.

- `patterns`: string | string[]
- `options`: object (optional)

### rename(...args)

Renames files in the build stream.

- `args`: Arguments for gulp-rename

### order(patterns?, options?)

Orders files in the stream by patterns.

- `patterns`: string | string[] (optional)
- `options`: object (optional)

### changed(dest?, options?)

Filters out unchanged files compared to the destination.

- `dest`: string (optional)
- `options`: object (optional)

### copy(globs, destPath, opts?) / copy(params, opts?)

Copies files from source to destination. Supports multiple sources/destinations.

- `globs`: string | string[]
- `destPath`: string
- `params`: CopyParam | CopyParam[]
- `opts`: CopyOptions (optional)

### del(patterns, options?)

Deletes files and folders synchronously.

- `patterns`: string | string[]
- `options`: DelOptions (optional)

### clean(cleanExtra?, options?)

Deletes clean targets with enhanced type safety.

- `cleanExtra`: string | string[] (optional)
- `options`: CleanOptions (optional)

### exec(command, options?)

Executes a shell command with error handling.

- `command`: string
- `options`: ExecOptions (optional)

### dest(folder?, options?)

Sets the destination directory for output. If not provided, uses config or current directory.

- `folder`: string (optional)
- `options`: object (optional)

### reload(options?)

Reloads changes to browser-sync if activated.

- `options`: browserSync.StreamOptions (optional)

### clear()

Removes all files in the build stream.

### clone(name?)

Clones the BuildStream instance.

- `name`: string (optional)

### on(...args)

Adds event handler to the stream.

- `args`: Arguments for Node.js stream.on

### promise(func | promise)

Adds a function or promise to the internal promise queue.

- `func`: () => unknown
- `promise`: Promise<unknown>

### chain(func)

Chains a plugin function to the build execution sequence.

- `func`: PluginFunction

### pipe(plugin, options?)

Adds a gulp plugin or transform to the build execution sequence.

- `plugin`: GulpStream | Transform
- `options`: {end?: boolean} (optional)

### debug(titleOrOptions?, otherOptions?)

Prints debug messages using gulp-debug2.

- `titleOrOptions`: string | DebugOptions
- `otherOptions`: DebugOptions (optional)

### intercept(interceptFunc?, onFinish?)

Adds a function to modify the contents of the stream.

- `interceptFunc`: (file, enc, cb) => unknown (optional)
- `onFinish`: (cb) => void (optional)

### peek(peekFunc?, onFinish?)

Monitors the contents of the build stream.

- `peekFunc`: (file) => void (optional)
- `onFinish`: (cb) => void (optional)

### sync()

Synchronizes the build stream with the internal promise queue. Returns a Promise<void>.

### finish()

Synchronizes and finishes the build stream. Returns a Promise that resolves when finished.

### log(...args)

Prints a message from this BuildStream instance.

- `args`: Parameters for console.log

### detachStream()

Detaches and returns the underlying stream, resetting the instance stream.

## Static Methods

- `BuildStream.nullStream()` — Returns a new PassThrough stream
- `BuildStream.through(transform?, flush?, options?)` — Creates a custom Transform stream
- `BuildStream.main(bs, buildFunc)` — Main build function for gulp task execution

## Example

```ts
import { BuildStream } from "gulp-tron";

const bs = new BuildStream("build-js");
bs.src("src/**/*.js").pipe(/* transform function or stream */).dest("dist/js");
```

## Notes

- BuildStream is designed to work seamlessly with Tron and Gulp tasks
- For advanced usage, refer to the Tron documentation and test code
