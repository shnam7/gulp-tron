import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import {Transform, PassThrough, Stream} from 'node:stream'
import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import gulp, {src} from 'gulp'
import {pEvent} from 'p-event'
import browserSync from 'browser-sync'
import {BuildStream} from '../src/build-stream.js'
import {timer} from '../src/utils/index.js'
import {exec} from '../src/utils/exec.js'

vi.mock('browser-sync', () => ({
    default: {
        active: true,
        stream: vi.fn(() => new PassThrough({objectMode: true})),
    },
}))

vi.mock('../src/utils/exec.js', () => ({
    exec: vi.fn().mockResolvedValue(undefined),
}))

// Mock all external dependencies
// vi.mock('gulp', () => ({
//     default: {
//         src: vi.fn(() => new PassThrough({objectMode: true})),
//         dest: vi.fn(() => new PassThrough({objectMode: true})),
//     },
// }))

// // Mock all external dependencies
// vi.mock('../src/globals.js', () => ({
//     gulp: {
//         src: vi.fn(() => new PassThrough({objectMode: true})),
//         dest: vi.fn(() => new PassThrough({objectMode: true})),
//     },
// }))

// vi.mock('del', () => ({
//     deleteSync: vi.fn(() => []),
// }))

// vi.mock('globby', () => ({
//     globbySync: vi.fn(() => []),
// }))

// vi.mock('gulp-debug2', () => ({
//     default: vi.fn(() => new PassThrough({objectMode: true})),
// }))

// vi.mock('../src/utils/exec.js', () => ({
//     exec: vi.fn().mockResolvedValue(undefined),
// }))

// vi.mock('gulp-filter', () => ({
//     default: vi.fn(() => new PassThrough({objectMode: true})),
// }))

// vi.mock('gulp-rename', () => ({
//     default: vi.fn(() => new PassThrough({objectMode: true})),
// }))

// vi.mock('gulp-order3', () => ({
//     default: vi.fn(() => new PassThrough({objectMode: true})),
// }))

// vi.mock('gulp-changed', () => ({
//     default: vi.fn(() => new PassThrough({objectMode: true})),
//     compareLastModifiedTime: vi.fn(),
//     compareContents: vi.fn(),
// }))

// vi.mock('../src/utils/copy.js', () => ({
//     copy: vi.fn(async () => {}),
// }))

const tmpDir = path.join(os.tmpdir(), 'build-stream-test')
const srcRoot = path.join(tmpDir, 'src')
const dest = path.join(tmpDir, 'dist')
const scriptFile = path.join(srcRoot, 'scripts', 'test.js')
const styleFile = path.join(srcRoot, 'styles', 'test.css')
const pkgFile = path.join(srcRoot, 'package.json')

function setupTestFiles() {
    fs.mkdirSync(path.dirname(scriptFile), {recursive: true})
    fs.mkdirSync(path.dirname(styleFile), {recursive: true})
    fs.writeFileSync(scriptFile, `console.log('hello')`)
    fs.writeFileSync(styleFile, 'body { color: blue; }')
    fs.writeFileSync(pkgFile, '{"name":"test"}')
    if (!fs.existsSync(scriptFile) || !fs.existsSync(scriptFile) || !fs.existsSync(pkgFile)) {
        throw new Error('Test files not created')
    }
}

function cleanupTestFiles() {
    try {
        fs.rmSync(tmpDir, {recursive: true, force: true})
    } catch {}
}

describe('BuildStream', () => {
    let bs: BuildStream
    beforeEach(() => {
        vi.clearAllMocks()
        bs = new BuildStream('test-stream')
        setupTestFiles()
    })
    afterEach(() => {
        vi.clearAllMocks()
        cleanupTestFiles()
    })

    describe('Core structure', () => {
        it('should handle static methods', () => {
            expect(BuildStream.nullStream()).toBeInstanceOf(Transform)
            expect(BuildStream.through()).toBeInstanceOf(Transform)
        })
        it('should have getters', () => {
            expect(bs.name).toBe('test-stream')
            expect(bs.className).toBe('BuildStream')
            expect(bs.stream).toBeInstanceOf(PassThrough)
            expect(bs.promiseQ).toBeInstanceOf(Promise)
            expect(bs.opts).toEqual({})
            expect(bs.performance.startTime).toBeGreaterThan(0)
            expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime)
            expect(bs.logger).toBeInstanceOf(Function)
        })
        it('should execute build function', async () => {
            const buildFunc = vi.fn()
            const bs = new BuildStream('test')
            const result = await BuildStream.main(bs, buildFunc)
            expect(buildFunc).toHaveBeenCalledWith(bs)
            expect(result).toBe(bs.stream)
        })
    })

    describe('Constructor', () => {
        it('should initialize with no argument', () => {
            const bs = new BuildStream()
            expect(bs).toBeInstanceOf(BuildStream)
            expect(bs.name).toBe('<anonymous>')
            expect(bs.opts).toEqual({})
            expect(bs.stream).toBeInstanceOf(PassThrough)
            expect(bs.performance.startTime).toBeGreaterThan(0)
            expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime)
            expect(bs.promiseQ).toBeInstanceOf(Promise)
            expect(bs.logger).toBeInstanceOf(Function)
        })
        it('should initialize with name argument only', () => {
            const bs = new BuildStream('test-name')
            expect(bs).toBeInstanceOf(BuildStream)
            expect(bs.name).toBe('test-name')
            expect(bs.opts).toEqual({})
            expect(bs.stream).toBeInstanceOf(PassThrough)
            expect(bs.promiseQ).toBeInstanceOf(Promise)
            expect(bs.performance.startTime).toBeGreaterThan(0)
            expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime)
        })
        it('should initialize with custom options', () => {
            const customOpts = {dest: './dist', sourcemaps: true}
            const bs = new BuildStream('custom-stream', customOpts)
            expect(bs.name).toBe('custom-stream')
            expect(bs.opts).toEqual(customOpts)
            expect(bs.stream).toBeInstanceOf(PassThrough)
            expect(bs.promiseQ).toBeInstanceOf(Promise)
        })
        it('should create an iinstance with name, stream, and promise arguments', () => {
            const stream = new PassThrough({objectMode: true})
            const promiseSync = new Promise<void>(resolve => {
                resolve()
            })
            const bs = new BuildStream('test-name', {}, stream, promiseSync)
            expect(bs).toBeInstanceOf(BuildStream)
            expect(bs.name).toBe('test-name')
            expect(bs.opts).toEqual({})
            expect(bs.stream).toBe(stream)
            // expect(bs.sync).toBe(promiseSync)
        })
    })

    describe('src method', () => {
        let mockSrc

        beforeEach(() => {
            mockSrc = vi
                .spyOn(gulp, 'src')
                .mockImplementation(() => new PassThrough({objectMode: true}))
        })
        afterEach(() => {
            mockSrc.mockRestore()
        })

        it('should call src with string pattern', () => {
            const src = path.join(srcRoot, '**/*.js')
            const result = bs.src(src)
            expect(result).toBe(bs)
            expect(mockSrc).toHaveBeenCalledTimes(1)
            expect(mockSrc).toHaveBeenCalledWith(src, {encoding: false, sourcemaps: false})
        })
        it('should call src with array of patterns', () => {
            const src = [path.join(srcRoot, '**/*.js'), path.join(srcRoot, '**/*.ts')]
            const result = bs.src(src)
            expect(result).toBe(bs)
            expect(mockSrc).toHaveBeenCalledTimes(1)
            expect(mockSrc).toHaveBeenCalledWith(src, {encoding: false, sourcemaps: false})
        })
        it('should call src with no argument', () => {
            const result = bs.src()
            expect(result).toBe(bs)
            expect(mockSrc).toHaveBeenCalledTimes(1)
            expect(mockSrc).toHaveBeenCalledWith('', {
                encoding: false,
                sourcemaps: false,
            })
        })
    })

    describe('add method', () => {
        it('should call src method when add is called before calling src', () => {
            const mockSrc = vi.spyOn(bs, 'src')

            bs.add('**/*.js')

            expect(mockSrc).toHaveBeenCalledTimes(1)
            expect(mockSrc).toHaveBeenCalledWith('**/*.js', {})
            mockSrc.mockRestore()
        })
        it('should add files to the stream', async () => {
            const src1 = path.join(path.dirname(scriptFile), '**/*.js')
            const src2 = path.join(path.dirname(styleFile), '**/*.css')
            const files: string[] = []

            bs.src(src1)
                .add(src2)
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')

            expect(files.length).toBe(2)
            expect(files).toContain(scriptFile)
            expect(files).toContain(styleFile)
        })
    })

    describe('remove method', () => {
        it('should remove files from the stream', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []

            bs.src(src)
                .remove('*.js')
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')
            expect(files.length).toBe(2)
            expect(files).toContain(path.join(srcRoot, 'styles/test.css'))
            expect(files).toContain(path.join(srcRoot, 'package.json'))
        })
    })

    describe('filter method', () => {
        it('should filter files in the stream', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []
            bs.src(src)
                .filter('*.css')
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')
            expect(files.length).toBe(1)
            expect(files).toContain(path.join(srcRoot, 'styles/test.css'))
        })
    })

    describe('rename method', () => {
        it('should rename files in the stream', async () => {
            const src = path.join(srcRoot, '**/*.js')
            const files: string[] = []
            bs.src(src)
                .rename({suffix: '.min'})
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')
            expect(files.length).toBe(1)
            expect(files[0]).toBe(path.join(srcRoot, 'scripts/test.min.js'))
        })
    })

    describe('order method', () => {
        it('should order files in the stream', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []
            bs.src(src)
                .order(['styles/**', 'scripts/**'])
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')
            expect(files.length).toBe(3)
            expect(files[0]).toBe(path.join(srcRoot, 'styles/test.css'))
            expect(files[1]).toBe(path.join(srcRoot, 'scripts/test.js'))
            expect(files[2]).toBe(path.join(srcRoot, 'package.json'))
        })
    })

    describe('changed method', () => {
        it('should pass none when no output exists', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []
            bs.src(src)
                .changed(dest)
                .peek(file => {
                    files.push(file.path)
                })
            await pEvent(bs.stream, 'finish')
            expect(files.length).toBe(3)
        })
        it('should pass all files when no file changed', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []
            await bs.src(src).dest(dest).finish()
            await bs
                .src(src)
                .changed(dest)
                .peek(file => {
                    files.push(file.path)
                })
                .finish()
            expect(files.length).toBe(0)
        })
        it('should pass changed file only', async () => {
            const src = path.join(srcRoot, '**/*.*')
            const files: string[] = []
            // generate output first
            await bs.src(src).dest(dest).sync()

            // wait for the stream to finish
            await timer(10)

            // change the script file and check if it is passed
            fs.writeFileSync(scriptFile, `console.log('now changed')`)
            await bs
                .src(src)
                .changed(dest)
                .peek(file => {
                    files.push(file.path)
                })
                .finish()

            expect(files.length).toBe(1)
            expect(files[0]).toBe(scriptFile)
        })
    })

    describe('del method', () => {
        it('should delete files in the stream', async () => {
            // generate output first
            await bs.src(path.join(srcRoot, '**/*.*')).dest(dest).finish()
            await timer(10) // wait for the stream to finish

            // delete one file from the generated files
            const targetFile = path.join(dest, 'scripts/test.js')
            expect(fs.existsSync(targetFile)).toBeTruthy()
            bs.del(path.join(dest, '**/*.js'), {force: true})
            // check if the file is deleted
            expect(fs.existsSync(targetFile)).toBeFalsy()

            const files: string[] = []
            await bs
                .src(path.join(dest, '**/*.*'))
                .peek(file => {
                    files.push(file.path)
                })
                .finish()

            expect(files.length).toBe(2)
            expect(files).toContain(path.join(dest, 'styles/test.css'))
            expect(files).toContain(path.join(dest, 'package.json'))
        })
    })

    describe('clean method', () => {
        it('should call del method with collected list of clean targets', async () => {
            // create a new BuildStream instance with clean option
            bs = new BuildStream('clean-test', {clean: dest})

            const extraCleanList = ['./temp/**']
            const mockDel = vi.spyOn(bs, 'del').mockReturnValue(bs)
            bs.clean(extraCleanList)

            expect(mockDel).toHaveBeenCalledTimes(1)
            expect(mockDel).toHaveBeenCalledWith([bs.opts.clean, ...extraCleanList], {
                logLevel: 'silent',
            })
            mockDel.mockRestore()
        })
    })

    describe('exec method', () => {
        it('should execute a command and return BuildStream', async () => {
            const command = 'echo "test"'
            const result = bs.exec(command)
            expect(result).toBe(bs)
            expect(exec).toHaveBeenCalledTimes(1)
            expect(exec).toHaveBeenCalledWith(command, expect.any(Object))
        })
    })

    describe('dest method', () => {
        it('should call gulp.dest with bs.opts.dest', async () => {
            // create a new BuildStream instance with dest option and create a mock for gulp.dest
            bs = new BuildStream('test', {dest})
            const mockDest = vi
                .spyOn(gulp, 'dest')
                .mockImplementation(() => new PassThrough({objectMode: true}))

            await bs.src(path.join(srcRoot, '**/*.*')).dest().finish()

            expect(mockDest).toHaveBeenCalledWith(dest, {sourcemaps: undefined})

            mockDest.mockRestore()
        })
    })

    describe('reload method', () => {
        it('should call browser-sync stream method', () => {
            bs.reload()
            expect(browserSync.stream).toHaveBeenCalledTimes(1)
        })
    })

    describe('clear method', () => {
        it('should clear the stream', async () => {
            const files: string[] = []
            const filesAfterClear: string[] = []
            await bs
                .src(path.join(srcRoot, '**/*.*'))
                .peek(file => {
                    files.push(file.path)
                })
                .clear()
                .peek(file => {
                    filesAfterClear.push(file.path)
                })
                .finish()

            expect(files.length).toBe(3)
            expect(filesAfterClear.length).toBe(0)
        })
    })

    describe('clone method', () => {
        it('should clone the BuildStream instance', async () => {
            const jsFiles: string[] = []
            const cssFiles: string[] = []

            const cssStream = bs.src(path.join(srcRoot, '**/*.*')).clone().filter('*.css')
            const jsStream = bs.filter('*.js')

            await jsStream
                .peek(file => {
                    jsFiles.push(file.path)
                })
                .finish()
            await cssStream
                .peek(file => {
                    cssFiles.push(file.path)
                })
                .finish()

            expect(jsFiles.length).toBe(1)
            expect(jsFiles).toContain(scriptFile)
            expect(cssFiles.length).toBe(1)
            expect(cssFiles).toContain(styleFile)
        })
    })

    describe('on method', () => {
        it('should handle stream events with on method', () => {
            const eventHandler = vi.fn()
            expect(bs.on('end', eventHandler)).toBe(bs)
            bs.stream.emit('end')
            expect(eventHandler).toHaveBeenCalledTimes(1)
        })
    })

    describe('promise method', () => {
        it('should process promises in sequence', async () => {
            const messages: string[] = []

            // normal function
            const f1 = () => messages.push('f1')

            // async function with delay
            const f2 = async () => {
                await timer(10) // simulate async operation
                messages.push('f2')
            }

            // second normal function: should waitl until f2 is finished
            const f3 = () => messages.push('f3')

            await bs.promise(f1).promise(f2).promise(f3).sync()

            expect(messages.length).toBe(3)
            expect(messages[0]).toBe('f1')
            expect(messages[1]).toBe('f2')
            expect(messages[2]).toBe('f3')
        })
    })

    describe('chain methods', () => {
        it('should execute function with this BuildStream as first argument and return BuildStream', () => {
            const fn = vi.fn(() => bs)
            const result = bs.chain(fn)
            expect(result).toBe(bs)
            expect(fn).toHaveBeenCalledWith(bs)
        })
    })

    describe('pipe method', () => {
        it('should pipe another stream to current build stream', async () => {
            const messages: string[] = []
            const plugin = BuildStream.through(undefined, cb => {
                messages.push('plugin called')
            })
            await bs.src(path.join(srcRoot, '**/*.*')).pipe(plugin).finish()
            expect(messages.length).toBe(1)
            expect(messages[0]).toBe('plugin called')
        })
    })

    describe('debug method', () => {
        it('should log debug messages', async () => {
            const consoleSpy = vi.spyOn(console, 'log')
            await bs.src(scriptFile).debug('debug message').finish()
            // await bs.src(path.join(srcRoot, '**/*.js')).debug('debug message').finish()
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('test-stream::debug message'),
            )
            consoleSpy.mockRestore()
        })
    })
})
