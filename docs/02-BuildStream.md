# BuildStream API
```ts
const build1 = {
    build: (bs: BuildStream) => { ... }
}
```
BuildStram is a wrapper class to a gulp stream instance returned from gulp.src() function,
bus has additional methods and properties helpful for build processing.

## Properties
| name | description |
|:-----|-----|
| name | TaskConfig name connected to this BuildStream. |
| className | Class name of the BuildStream instance, `BuildStream`. |
| stream | Gulp stream instance returned from gulp.src(). |
| promiseSync | Internal promise instance handling sequencial sync operations. |
| opts | TaskConfig object connected to this BuildStream instance. |


## Methods

### bs.src()
```ts
src(options: SrcOptions) => this
src(globs?: Parameters<SrcMethod>[0], options?: SrcOptions) => this
```
This is a wrapper to gulp.src() with glob parameter optional. If glob is not
provided, then `conf.src` is used instead. If glob is valid, then `conf.src`
is ignored.

If both glob and `conf.src` are missing, then no gulp stream is created. If
options.sourcemaps are not present, then `conf.sourcemaps` are used if available.

options.encoding is intentionally set to false by default, which is experimental.
gulp v5 sets the encoding to `utf8` by default, whcih makes binary files to be
bloated. So, make sure to set it to false when dealing with binary files.

After creating the stream, `bs.order()` is called to sort the files in the stgream.

#### Parameters
The same as gulp.src() parameters except the variation described above.

#### Return value
BuildStream itself.


### bs.addSrc()
```ts
addSrc(...args: Parameters<SrcMethod>) => this
```
Add files to current stream. If no stream created yet, then it is the same as
calling bs.src().

#### Parameters
The same as bs.src().

#### Return value
BuildStream itself.


### order
```ts
order(...args: Parameters<typeof order>) => this
```
Orders the files in the stream using [`gulp-order3`](https://github.com/shnam7/gulp-order3) plugin.
If no pattern is provided as argument, then `conf.order` is used as the sort pattern.

Refer to [`gulp-order3`](https://github.com/shnam7/gulp-order3) for more details.

#### Parameters
The same as `gulp-order3`.

#### Return value
BuildStream itself.


### bs.changed()
```ts
changed(dest?: Parameters<DestMethod>[0], options: Parameters<typeof changedG>[1] = {}) => this
```
Filters out unchanged files. It uses [`gulp-changed`](https://github.com/sindresorhus/gulp-changed)
plugin with `compareContents` as change detection method.

#### Parameters
| option | description |
|:-----:|-----|
| dest | same as parameters of gulp.dest(). |
| options | same as parameters of [`gulp-changed`](https://github.com/sindresorhus/gulp-changed). |

Refer to [`gulp-changed`](https://github.com/sindresorhus/gulp-changed) for more details.

#### Return value
BuildStream itself.


### bs.dest()
```ts
    dest(): this        // call with no argument falls back to '.', which is current directory.
    dest(...args: Parameters<DestMethod> | []) => this
```
This is a wrapper to gulp.dest() with all the parameter optional. If destination
folder is not provided, the `conf.dest` is used instead. If both folder argument
and `conf.dest` are missing, then current directory `.` is used.

If options.sourcemaps are not provided, then `conf.sourcemaps` is used.

#### Parameters
The same as gulp.dest() except the variations described above.

#### Return value
BuildStream itself.


### bs.on()
```ts
on(...args: Parameters<typeof Stream.prototype.on>) => this
```
This is a wrapper to stream.on().

Refer to NodeJS Stream API for the details. If you are using gulp v5,
then refer to [`streamx`](https://github.com/mafintosh/streamx) documentation.

#### Parameters
The same as NodeJS Stream events.

### Return value
BuildStream itself.


### bs.promise()
```ts
promise(func: Function) => this
promise(promise: Promise<any>) => this
```
Add func to the internal promise queue. All the promises added to internal
promise queue are executed in sequence synchronously.

#### Parameters
| option | description |
|:-----:|-----|
| func | Function to be executed in sync mode. |
| promise | A promise instance to be added to internal promise queue. |

#### Return value
BuildStream itself.


### bs.then()
```ts
then(func: Function) => this
```
Execute func after all the promises in the internal promise queue.

#### Parameters
| option | description |
|:-----:|-----|
| func | Function to be executed in sync mode. |

#### Return value
BuildStream itself.


### bs.pipe()
```ts
export type PluginFunction = (bs: BuildStream) => void

pipe(func: PluginFunction) => this
pipe(gulpPlugin: GulpStream, options?: { end?: boolean | undefined }) => this
```
Add Tron plugin function or gulp plugin into build execution sequence.

#### Parameters
| option | description |
|:-----:|-----|
| func | Tron plugin function to be executed. |
| gulpPlugin | Gulp plugin module to be piped into gulp stream in current build sequence. |
| options | Options to be passed to NodeJS Stream pipe() function. |

#### Return value
BuildStream itself.


### bs.filter()
```ts
import filter from 'gulp-filter'

filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"], options: filter.Options = {}) => this
```
Filter files in the stream with glob patterns. In other words, select or deselect the files.

Refer to [`gulp-filter`](https://github.com/sindresorhus/gulp-filter) for more information on the filtering.

#### Parameters
| option | description |
|:-----:|-----|
| pattern | Optional filter pattern with default valuse selecting all files except .map files. |
| options | Options to be passed to `gulp-filter`. |

#### Return value
BuildStream itself.


### bs.rename()
```ts
import rename from 'gulp-rename'

rename(...args: Parameters<typeof rename>) => this
```
Rename files in the build stream using 'gulp-rename'. This is just a handy function for
using `gulp-rename`.

Refer to [`gulp-rename'](https://github.com/hparra/gulp-rename) for more information.

#### Parameters
| option | description |
|:-----:|-----|
| pattern | Optional filter pattern with default valuse selecting all files except .map files. |
| args | arguments to be passed to `gulp-filter`. |

#### Return value
BuildStream itself.


### bs.copy()
```ts
import changedG from `gulp-changed`

export type CopyParam = { src: string | string[], dest: string }
export type CopyOptions =
    & NonNullable<Parameters<typeof changedG>[1]>
    & LogOptions
export type LogOptions = {
    logLevel?: 'verbose' | 'normal' | 'silent',
    logger?: (...args: any[]) => void
}

copy(globs: string | string[], destPath: string, opts: CopyOptions) => this
copy(params?: CopyParam | CopyParam[], opts?: CopyOptions) => this
```
Copy changed files. Internally `gulp-changed` is used with `compareContents` as change detection method, to filter out the unchanged files.

#### Parameters
| option | description |
|:-----:|-----|
| globs | Source files to copy. |
| destPath | destination path to copy. |
| params | List of CopyParam objects (src to dest pairs). |
| opts | Copy options. Options from `gulp-changed` can be used. LogOptions can also be added. |

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
Delete files in sync mode using deleteSync() from [`del`](https://github.com/sindresorhus/del).

#### Parameters
| option | description |
|:-----:|-----|
| patterns | Files to delete. |
| options | Options from `del` and LogOptions. |

#### Return value
BuildStream itself.


### bs.clean()
```ts
clean(cleanExtra: string | string[] = [], options: CleanOptions = {}) => this
```
Clean targets specified in TasConfig `conf.clean`, and cleans `cleanExtra` additionally.

#### Parameters
| option | description |
|:-----:|-----|
| cleanExtra | additional clean target. }
| options | Clean options including delOptions to be delivered to this.del(). |


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

#### Parameters
| option | description |
|:-----:|-----|
| command | Command to be executed. |
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
| option | description |
|:-----:|-----|
| options | Command to be executed. |

#### Return value
BuildStream itself.


### bs.clearStream()
```ts
clearStream() => this
```
Reset current build stream to null. Previoius build stream is moved to internal
promise queue for safe closing if it was active.

#### Return value
BuildStream itself.


### bs.pushStream()
```ts
pushStream(clearStream: boolean = false) => this
```
Push current build stream to internal stack. Optionally resets current build stream.

#### Parameters
| option | description |
|:-----:|-----|
| clearStream | if true, current build stream is cleared. default false. |

#### Return value
BuildStream itself.


### bs.popStream()
```ts
popStream() => this
```
If pushed stream is available, then clear current and pop the pushed stream back to cuerrent.

#### Return value
BuildStream itself.


### bs.debug()
```ts
debug(options: Parameters<typeof debug>[0] = {}) => this
```
Print debug message using [`gulp-debug`](https://github.com/sindresorhus/gulp-debug).

#### Parameters
| option | description |
|:-----:|-----|
| options | Options to be passed to `gulp-stream`. |

#### Return value
BuildStream itself.


### bs.intercept()
```ts
export interface ResultCallback<T> { (err?: Error | null, result?: T): void; }

intercept(interceptFunc: (file: any, cb: ResultCallback<any>) => void) => this
```
Add a function to be modify the contents of the stream.

#### Parameters
| option | description |
|:-----:|-----|
| interceptFunc | Function to modify the contents of the stream. |

#### Example
```ts
import tron from 'gulp-tron'

tron.createTask({
    name: 'intercept-test',
    build: bs => {
        // take '*/css' files only
        bs.src()
            .debug()
            .intercept((file, cb) => {
                if (file.path.endsWith('.css')) cb(null, file)
                cb(null)
            })
            .debug()
    },
    src: ['./scss/*.*']
})
```

#### Return value
BuildStream itself.


### bs.peek()
```ts
peek(peekFunc: (file: any) => void) => this
```
Add a function to monitor the contents of the stream.

#### Parameters
| option | description |
|:-----:|-----|
| peekFunc | Function to monitor the contents of the stream. |

#### Example
```ts
import tron from 'gulp-tron'

tron.createTask({
    name: 'peek-test',
    build: bs => {
        // take '*/css' files only
        let cssFileCount = 0
        bs.src()
            .debug()
            .peek((file) => {
                if (file.path.endsWith('.css')) ++cssFileCount
            })
            .debug(`cssFileCount=${cssFileCount}`)
    },
    src: ['./scss/*.*']
})
```
#### Return value
BuildStream itself.



```ts
    //-------------------------------------------------------------------------
    // Utilities
    //-------------------------------------------------------------------------
    log(...args: Parameters<typeof console.log>): this {
        const logger = this.opts.logger || console.log
        logger(`${this.name}::`, ...args)
        return this
    }

    get logger(): typeof console.log {
        const _logger = (...args: Parameters<typeof console.log>) => {
            this.log(...args)
        }
        return _logger
    }
}
```
