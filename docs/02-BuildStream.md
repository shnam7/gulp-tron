# BuildStream API

```ts
const build1 = {
    build: (bs: BuildStream) => { ... }
}
```

BuildStram is a wrapper class to a gulp stream instance returned from gulp.src() function,
bus has additional methods and properties helpful for build processing.

## Properties

| name      | description                                                                   |
| :-------- | ----------------------------------------------------------------------------- |
| name      | TaskConfig name connected to this BuildStream.                                |
| className | Class name of this BuildStream instance, `BuildStream`.                       |
| stream    | Node Transform stream instance.                                               |
| sync      | Last promise of all the promise sequence created during the build operations. |
| opts      | `BuildOptions` object connected to this BuildStream instance.                 |

## Methods

### bs.src()

```ts
src(globs?: Parameters<SrcMethod>[0], options?: SrcOptions) => this
```

This is a wrapper to gulp.src() with glob parameter optional. If glob is not
provided, `conf.src` is used instead. If glob is valid, then `conf.src`
is ignored.

If both glob and `conf.src` are missing, then no gulp stream is created. If
options.sourcemaps are not present, then `conf.sourcemaps` are used if available.

options.encoding is intentionally set to false by default, which is experimental.
gulp v5 sets the encoding to `utf8` by default, whcih makes binary files to be
bloated. So, make sure to set it to false when dealing with binary files.

After creating the stream, `bs.order()` is called to sort the files in the stgream.

#### Parameters

| name           | default     | description                                                   |
| :------------- | ----------- | ------------------------------------------------------------- |
| globOrOptions? | bs.opts.src | Glob string or array of glob strings.                         |
| options?       | {}          | `BuildOptions` object connected to this BuildStream instance. |

The same as gulp.src() parameters except the globs parameter can is optional.

#### Return value

BuildStream itself.

### bs.add()

```ts
add(globs: Parameters<SrcMethod>[0], options?: SrcOptions) => this
```

Add files to current stream. If no stream created yet, then it is the same as
calling bs.src().

#### Parameters

| name     | default   | description                                                   |
| :------- | --------- | ------------------------------------------------------------- |
| globs    | undefined | Glob string or array of glob strings.                         |
| options? | {}        | `BuildOptions` object connected to this BuildStream instance. |

#### Return value

BuildStream itself.

### bs.remove()

```ts
remove(patterns?: string | string[]) => this
```

Remove files with glob patterns from the build stream.

#### Parameters

|   name    | description                                                  |
| :-------: | ------------------------------------------------------------ |
| patterns? | Optional glob patterns with default value of selecting none. |

#### Return value

BuildStream itself.

### bs.filter()

```ts
import filterG from 'gulp-filter'

filter(...args: Parameters<typeof filterG>) => this
```

Filter files in the stream with glob patterns. In other words, select only the files matching the filtern patterns.

Refer to [`gulp-filter`](https://github.com/sindresorhus/gulp-filter) for more information on the filtering.

This is using gulp-filter, but there are two differences on the first argument `pattern`:

-   The `pattern` can be optional, which means select all (no filtering).
-   If the `pattern` starts with '!', then '\*' is prepended, so that the result can be all except the negated pattern

So, bs.filter('\*.map') will select all except '\*.map' files.

#### Parameters

Refer to [`gulp-filter`](https://github.com/sindresorhus/gulp-filter) for the parameters.

#### Return value

BuildStream itself.

### bs.rename()

```ts
import renameG from 'gulp-rename'

rename(...args: Parameters<typeof renameG>) => this
```

Rename files in the build stream using 'gulp-rename'. This is just a handy function for
using `gulp-rename`.

Refer to [`gulp-rename'](https://github.com/hparra/gulp-rename) for more information.

#### Parameters

Refer to [`gulp-rename'](https://github.com/hparra/gulp-rename) for the parameters.

#### Return value

BuildStream itself.

### order

```ts
order(...args: Parameters<typeof order>) => this
```

Order the files in the stream using [`gulp-order3`](https://github.com/shnam7/gulp-order3).
If no pattern is provided, then `bs.opts.order` is used as the sort pattern.

Refer to [`gulp-order3`](https://github.com/shnam7/gulp-order3) for more details.

#### Parameters

Refer to [`gulp-order3`](https://github.com/shnam7/gulp-order3) for the parameters.

#### Return value

BuildStream itself.

### bs.changed()

```ts
changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}) => this
```

Remove unchaned files from the stream. The change detection is done by comparing _modified date_, _file size_, and _file content_ in sequence.

#### Parameters

|  name   | description                                                                           |
| :-----: | ------------------------------------------------------------------------------------- |
|  dest   | same as parameters of gulp.dest().                                                    |
| options | same as parameters of [`gulp-changed`](https://github.com/sindresorhus/gulp-changed). |

Refer to [`gulp-changed`](https://github.com/sindresorhus/gulp-changed) for more details.

#### Return value

BuildStream itself.

### bs.clone()

```ts
    clone(name?: string) => BuildStream
```

Clone this BuildStream instance.

#### Parameters

| name | description                              |
| :--: | ---------------------------------------- |
| name | Name of the cloned BuildStream instance. |

#### Return value

Cloned BuildSream instance.

### bs.clear()

```ts
    clear() => this
```

Remove all the files in the build stream.

#### Parameters

None

#### Return value

BuildStream itself.

### bs.dest()

```ts
    dest(...args: Parameters<DestMethod> | undefined[]) =>this
```

This is a wrapper to gulp.dest(), but all the parameters are optional. If destination
folder is not provided, the `conf.dest` is used instead. If both folder argument
and `conf.dest` are missing, then current directory `.` is used.

If options.sourcemaps are not provided, then `conf.sourcemaps` is used.

#### Parameters

The same as parameters of gulp.dest() except the variations described above.

#### Return value

BuildStream itself.

### bs.on()

```ts
on(...args: Parameters<typeof Stream.prototype.on>) => this
```

Shortcut to bs.stream.on().

Refer to NodeJS [Stream API](https://nodejs.org/docs/latest/api/stream.html) for the details.

#### Parameters

The same as parameters of bs.stream.on()

### Return value

BuildStream itself.

### bs.promise()

```ts
promise(func: () => unknown) => this
promise(promise: Promise<unknown>) => this
```

Add func to internal promise queue. All the promises in the internal promise queue are executed in sequence synchronously.

#### Parameters

|  name   | description                                               |
| :-----: | --------------------------------------------------------- |
|  func   | Function to be added to internal promise queue.           |
| promise | A promise instance to be added to internal promise queue. |

#### Return value

BuildStream itself.

### bs.chain()

```ts
    chain(func: PluginFunction) => this
```

Chain plugin function into build execution sequence.

#### Parameters

| name | description                    |
| :--: | ------------------------------ |
| func | Plugin function to be chained. |

#### Return value

BuildStream itself.

### bs.pipe()

```ts
pipe(gulpPlugin: GulpStream | Transform, options?: {end?: boolean}) => this
```

Add gulp-plugin into build execution sequence.

#### Parameters

|    name    | description                                                                |
| :--------: | -------------------------------------------------------------------------- |
| gulpPlugin | Gulp plugin module to be piped into gulp stream in current build sequence. |
|  options   | Options to be passed to NodeJS Stream pipe() function.                     |

#### Return value

BuildStream itself.

### bs.copy()

```ts
export type CopyParam = { src: string | string[], dest: string }
export type CopyOptions = {dryRun?: boolean} & LogOptions
export type LogOptions = {    logLevel?: 'verbose' | 'normal' | 'silent',
    logger?: (...args: any[]) => void
}

copy(globs: string | string[], destPath: string, opts: CopyOptions) => this
copy(params?: CopyParam | CopyParam[], opts?: CopyOptions) => this
```

Copy files from source to destination. The Copy is done only for the changed files. The change detection is done by comparing _modified date_, _file size_, and _file content_ in sequence.

#### Parameters

|     name      | description                                         |
| :-----------: | --------------------------------------------------- |
|     globs     | Source files to copy.                               |
|   destPath    | destination path to copy.                           |
|    params     | List of CopyParam objects (src to dest pairs).      |
|  opts.dryRun  | Run copy process without actual copy.               |
| opts.logLevel | 'verbose', 'normal', 'silent'.                      |
|  opts.logger  | Logger function of type `(...args: any[]) => void`. |

#### Return value

BuildStream itself.

### bs.del()

```ts
import type { Options as delOptions } from 'del'

export type DelOptions = delOptions & LogOptions
export type LogOptions = {
    logLevel?: 'verbose' | 'normal' | 'silent',
    logger?: (...args: any[]) => void
}

del(patterns: string | string[], options: DelOptions = {} => this
```

Delete files and folders synchrously using deleteSync() from [`del`](https://github.com/sindresorhus/del).

#### Parameters

|  option  | description                                  |
| :------: | -------------------------------------------- |
| patterns | Files and folders to delete in glob pattern. |
| options  | Options to `del` and LogOptions.             |

#### Return value

BuildStream itself.

### bs.clean()

```ts
clean(cleanExtra: string | string[] = [], options: CleanOptions = {}) => this
```

Delete clean targets specified in `this.opts.clean` and files and folders specified in `cleanExtra` additionally.

#### Parameters

|    name    | description                                                       |
| :--------: | ----------------------------------------------------------------- |
| cleanExtra | additional clean targets in glob pattern.                         |
|  options   | Clean options including delOptions to be delivered to this.del(). |

#### Return value

BuildStream itself.

### bs.exec()

```ts
import type { SpawnOptions } from 'child_process'

export type ExecOptions = SpawnOptions & LogOptions
export type LogOptions = {
    logLevel?: 'verbose' | 'normal' | 'silent',
    logger?: (...args: any[]) => void
}

exec(command: string, options: ExecOptions) => this
```

Execute `command` string passing it to shell.

#### Parameters

|  name   | description                                                  |
| :-----: | ------------------------------------------------------------ |
| command | Command string to be executed.                               |
| options | LogOptions & Ooptions to be passed to child_process.spawn(). |

#### Return value

BuildStream itself.

### bs.reload()

```ts
import browserSync from 'browser-sync'

reload(options?: browserSync.StreamOptions) => this
```

Reload the changes to browser-sync, if it is activated.

#### Parameters

|  name   | description                               |
| :-----: | ----------------------------------------- |
| options | Options to browserSync.stream() function. |

#### Return value

BuildStream itself.

### bs.clear()

```ts
clear() => this
```

Reset current build stream to null. Previoius build stream is moved to internal
promise queue for safe closing if it was active.

#### Return value

BuildStream itself.

#### Parameters

| option | description                                       |
| :----: | ------------------------------------------------- |
| clear  | All files in the current build stream is removed. |

#### Return value

BuildStream itself.

### bs.debug()

```ts
debug(options: Parameters<typeof debug>[0] = {}) => this
```

Print debug message using [`gulp-debug2`](https://github.com/shnam7/gulp-debug2).

#### Parameters

| option  | description                                                                     |
| :-----: | ------------------------------------------------------------------------------- |
| options | Options to be passed to [`gulp-debug2`](https://github.com/shnam7/gulp-debug2). |

#### Return value

BuildStream itself.

### bs.intercept()

```ts
export interface ResultCallback<T> { (err?: Error | null, result?: T): void; }

intercept(
    interceptFunc?: (file: Vinyl, enc: BufferEncoding, cb: TransformCallback) => unknown,
    onFinish?: (cb: TransformCallback) => void,
) => this
```

Add a function to modify the contents of the stream.

#### Parameters

|     name      | description                                                               |
| :-----------: | ------------------------------------------------------------------------- |
| interceptFunc | Function to be called for each file entry in the build stream.            |
|   onFinish    | Function to be called after processing all the files in the build stream. |

#### Example

```ts
import tron from 'gulp-tron'

tron.createTask({
    name: 'intercept-test',
    build: bs => {
        bs.src()
            .debug()
            .intercept((file, cb) => {
                // take '*/css' files only
                if (file.path.endsWith('.css')) cb(null, file)
                cb(null)
            })
            .debug()
    },
    src: ['./scss/*.*'],
})
```

#### Return value

BuildStream itself.

### bs.peek()

```ts
peek(peekFunc: (file: any) => void) => this
```

Add a function to monitor the contents of the build stream.

#### Parameters

|   name   | description                                                               |
| :------: | ------------------------------------------------------------------------- |
| peekFunc | Function to be called for each file entry in the build stream.            |
| onFinish | Function to be called after processing all the files in the build stream. |

#### Example

```ts
import tron from 'gulp-tron'

tron.createTask({
    name: 'peek-test',
    build: bs => {
        let cssFileCount = 0
        bs.src()
            .debug()
            .peek(file => {
                // take '*.css' files only
                if (file.path.endsWith('.css')) ++cssFileCount
            })
            .debug(`cssFileCount=${cssFileCount}`)
    },
    src: ['./scss/*.*'],
})
```

#### Return value

BuildStream itself.

### bs.log()

```ts
log(...args: Parameters<typeof console.log>) => this
```

Print message from this BuildStream instance.

#### Parameters

| name | description     |
| :--: | --------------- |
| args | Items to print. |

#### Return value

BuildStream itself.
