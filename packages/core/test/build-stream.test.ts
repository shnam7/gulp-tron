import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {Transform} from 'node:stream'
import {type MockInstance, afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type Vinyl from 'vinyl'
import {pEvent} from 'p-event'
import {BuildStream} from '../src/build-stream.js'
import {gulp} from '../src/globals.js'
import {type DestOptions, type SrcOptions, type BuildOptions} from '../src/types.js'

const __pathname = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__pathname)
const __srcGlob = path.join(__dirname, '../src/core/*.ts')
const __srcFiles: string[] = []

await pEvent(
    gulp.src(__srcGlob).pipe(
        new Transform({
            objectMode: true,
            highWaterMark: 16,
            transform(file: Vinyl, enc, cb) {
                __srcFiles.push(file.basename)
                cb(null)
            },
        }),
    ),
    'finish',
)

describe('BuildStream.nullStream()', () => {
    it('is instance of NodeJS.ReadWriteStream().', () => {
        const ns = BuildStream.nullStream()
        expect(ns).instanceOf(Transform)
    })
})

describe('.constructor', () => {
    it('can be created with no argument.', () => {
        const bs = new BuildStream()
        expect(bs).instanceOf(BuildStream)
        expect(bs.name).toBe('<annonymous>')
    })
    it('can be created with argument.', () => {
        const name = 'sample'
        const conf = {src: 'sample-src/*.*'}
        const stream = BuildStream.nullStream()
        const bs = new BuildStream(name, conf, stream)
        expect(bs).instanceOf(BuildStream)
        expect(bs.name).toBe(name)
        expect(bs.className).toBe('BuildStream')
        expect(bs.stream).toBe(stream)
        expect(bs.opts.src).toBe(conf.src)
        expect(bs.sync).toBeInstanceOf(Promise)
    })
})

describe('.src()', () => {
    let srcMock: MockInstance
    let resultGlob: string | string[]
    let resultOptions: SrcOptions
    const gulpSrc = gulp.src

    beforeEach(() => {
        srcMock = vi
            .spyOn(gulp, 'src')
            .mockImplementation((globs: string | string[], options: SrcOptions | undefined) => {
                resultGlob = globs
                resultOptions = {...options}
                return gulpSrc(globs, options)
            })
    })
    afterEach(() => {
        srcMock?.mockRestore()
    })

    it('can be called with no argument, using TaskConf.src as default.', () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultGlob).toBe(bs.opts.src)
    })
    it('can override TaskConf.src(default glob).', () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const srcOverride = './src/utils'
        bs.src(srcOverride)
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultGlob).not.toBe(bs.opts.src)
        expect(resultGlob).toBe(srcOverride)
    })
    it('does nothing if no glob is provided.', () => {
        const bs = new BuildStream()
        const srcMock = vi.spyOn(gulp, 'src')
        bs.src()
        expect(srcMock).not.toHaveBeenCalled()
        srcMock.mockRestore()
    })
    it('can override sourcemaps option.', () => {
        const bs = new BuildStream('test', {src: 'test.*', sourcemaps: false})
        bs.src({sourcemaps: true})
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultOptions.sourcemaps).toBeTruthy()
    })

    it('has default encoding value of false (transcode disabled).', () => {
        const bs = new BuildStream('test', {src: 'test.*'})
        bs.src()
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultOptions.encoding).toBe(false)
    })

    it('can override encoding option.', () => {
        const bs = new BuildStream('test', {src: 'test.*'})
        bs.src({encoding: 'utf8'})
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultOptions.encoding).toBe('utf8')
    })

    it(`calls .order() when 'order' option is given.`, async () => {
        const bs = new BuildStream('test', {
            src: __srcGlob,
            order: ['types.ts', 'global.ts', 'build-stream.ts'],
        })
        const orderMock = vi.spyOn(bs, 'order')

        bs.src()
        await pEvent(bs.stream, 'finish')

        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(orderMock).toHaveBeenCalledTimes(1)
    })
})

describe('.add()', () => {
    it('can be called before or w/o .src() call.', async () => {
        const bs = new BuildStream('test')
        let fileCount = 0
        bs.add(__srcGlob).peek(() => ++fileCount)
        await pEvent(bs.stream, 'finish')
        expect(fileCount).toBe(__srcFiles.length)
    })

    it('can be called after .src() call.', async () => {
        const bs = new BuildStream('test')
        const files: string[] = []
        bs.src(__srcGlob)
            .add(__pathname)
            .peek(file => files.push(file.basename))
        await pEvent(bs.stream, 'finish')
        expect(files).toEqual([...__srcFiles, path.basename(__pathname)])
    })
})

describe('.remove()', () => {
    it('can handle call with no argument.', async () => {
        const bs = new BuildStream('test')
        let fileCount = 0
        bs.src(__srcGlob)
            .remove()
            .peek(() => ++fileCount)
        await pEvent(bs.stream, 'finish')
        expect(fileCount).toBe(__srcFiles.length)
    })

    it('can handle negation.', async () => {
        const bs = new BuildStream('test')
        const files: string[] = []
        bs.src(path.join(__dirname, '*'))
            .remove('!build-stream*')
            .peek(file => files.push(file.basename))
        await pEvent(bs.stream, 'finish')
        expect(files).toEqual([path.basename(__pathname)])
    })
})

describe('.filter()', () => {
    it('filters files in the stream.', async () => {
        const allFiles: string[] = []
        const tFiles: string[] = []

        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
            .peek(file => allFiles.push(file.basename))
            .filter('t*.ts')
            .peek(file => tFiles.push(file.basename))
        await pEvent(bs.stream, 'finish')

        expect(allFiles.length).toBe(4)
        expect(tFiles.length).toBe(2)
        expect(tFiles).toEqual(['tron.ts', 'types.ts'])
    })
})

describe('.rename()', () => {
    it('renames files in the stream.', async () => {
        const renamedFiles: string[] = []

        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
            .rename({extname: 'ts-renamed'})
            .peek(file => renamedFiles.push(file.basename))
        await pEvent(bs.stream, 'finish')

        expect(renamedFiles.length).toBe(4)
        for (const file of renamedFiles) {
            expect(file.endsWith('ts-renamed')).toBeTruthy()
        }
    })
})

describe('.order()', () => {
    it('order files in the stream.', async () => {
        const originalList: string[] = []
        const orderedList: string[] = []

        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
            .add(path.join(__dirname, '../package.json'))
            .peek(file => originalList.push(file.basename))
            .order('package.json')
            .peek(file => orderedList.push(file.basename))
        await pEvent(bs.stream, 'finish')

        expect(originalList.length).toBeGreaterThan(0)
        expect(orderedList.length).toBeGreaterThan(0)
        expect(originalList[0]).not.toBe(orderedList[0])
        expect(orderedList[0]).toBe('package.json')
    })
})

describe('.changed()', () => {
    it('does not pipe to gulp-changed if destination is not valid.', async () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const pipeMock = vi.spyOn(bs, 'pipe')
        bs.src().changed()
        await pEvent(bs.stream, 'finish')
        expect(pipeMock).toHaveBeenCalledTimes(1) // 1 time call inside src(), not changed()
        pipeMock.mockRestore()
    })

    it('pipes to gulp-changed if valid destination is given.', async () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const pipeMock = vi.spyOn(bs, 'pipe')
        bs.src().changed('.')
        await pEvent(bs.stream, 'finish')
        expect(pipeMock).toHaveBeenCalledTimes(2)
        pipeMock.mockRestore()
    })

    it('uses conf.dest as default destination.', async () => {
        const bs = new BuildStream('test', {src: __srcGlob, dest: '.'})
        const pipeMock = vi.spyOn(bs, 'pipe')
        bs.src().changed()
        await pEvent(bs.stream, 'finish')
        expect(pipeMock).toHaveBeenCalledTimes(2)
        pipeMock.mockRestore()
    })
})

describe('.dest()', () => {
    let destMock: MockInstance
    let folder: string | ((file: Vinyl) => string)
    let options: DestOptions
    beforeEach(() => {
        destMock = vi
            .spyOn(gulp, 'dest')
            .mockImplementation(
                (folder_: string | ((file: Vinyl) => string), opt?: DestOptions) => {
                    folder = folder_
                    options = opt ?? {}
                    return BuildStream.nullStream() as NodeJS.ReadWriteStream
                },
            )
    })

    afterEach(() => {
        destMock.mockRestore()
    })

    it(`can be called with no argument: destination defaults to '.'`, () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src().dest()
        expect(destMock).toHaveBeenCalledTimes(1)
        expect(folder).toBe('.')
    })

    it(`can be called with no argument: destination using TaskConfig.dest.`, () => {
        const bs = new BuildStream('test', {src: __srcGlob, dest: 'dest-path'})
        bs.src().dest()
        expect(destMock).toHaveBeenCalledTimes(1)
        expect(folder).toBe(bs.opts.dest)
    })

    it(`can override default destination '.'.`, () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const newDest = 'new-dest'
        bs.src().dest(newDest)
        expect(destMock).toHaveBeenCalledTimes(1)
        expect(folder).toBe(newDest)
    })

    it(`can override TaskConfig.dest.`, () => {
        const bs = new BuildStream('test', {src: __srcGlob, dest: 'dest-path'})
        const newDest = 'new-dest'
        bs.src().dest(newDest)
        expect(destMock).toHaveBeenCalledTimes(1)
        expect(folder).toBe(newDest)
    })
})

describe('.on()', () => {
    it('calls bs.stream.on().', async () => {
        const bs = new BuildStream()
        const onMoke = vi.spyOn(bs, 'on')
        bs.on('end', () => {})
        expect(onMoke).toHaveBeenCalledTimes(1)
        onMoke.mockRestore()
    })
})

describe('.promise()', () => {
    const sequence: number[] = []

    it('accept function.', async () => {
        sequence.splice(0) // clear array
        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
        for (let i = 0; i < 100; i++) bs.promise(() => sequence.push(i))
        await bs.sync
        for (let i = 0; i < 100; i++) expect(sequence[i]).toBe(i)
    })

    it('accept promise.', async () => {
        sequence.splice(0)
        const bs = new BuildStream('test', {src: __srcGlob})
        let i = 0
        const promisePush = async () =>
            new Promise<void>(resolve => {
                sequence.push(i++)
                resolve()
            })
        bs.src()
        for (let i = 0; i < 100; i++) bs.promise(promisePush())
        await bs.sync
        sequence.push(i++)
        for (let i = 0; i <= 100; i++) expect(sequence[i]).toBe(i)
    })
})

describe('.chain()', () => {
    it('calls the plugin function with current build stream.', () => {
        const bs = new BuildStream('test')
        const plugin = (bs1: BuildStream) => {
            expect(bs1).toBe(bs)
            bs1.src()
        }

        const srcMock = vi.spyOn(bs, 'src')
        bs.chain(plugin)
        expect(srcMock).toHaveBeenCalledTimes(1)
        srcMock.mockRestore()
    })
})

describe('.pipe()', () => {
    it('calls bs.stream.pipe.', () => {
        const bs = new BuildStream('test')
        const ts = new Transform()
        const pipeMock = vi.spyOn(bs.stream, 'pipe')
        pipeMock.mockReturnValue(ts)
        expect(bs.pipe(ts).stream).toBe(ts)
        expect(pipeMock).toHaveBeenCalledTimes(1)
        pipeMock.mockRestore()
    })
})

describe('.copy()', () => {
    it('prints default log messages.', async () => {
        const messages: string[] = []
        const consoleMock = vi
            .spyOn(console, 'log')
            .mockImplementation((...args: any[]) => messages.push(args.join('')))
        const bs = new BuildStream('test')
        bs.copy({src: __srcGlob, dest: './dummy'}, {dryRun: true})
        expect(messages.length).toBe(2)
        expect(messages[0].startsWith(`${bs.name}::copy:`)).toBeTruthy()
        expect(messages[1].startsWith(`${bs.name}::  >>>: ${__srcFiles.length} file`)).toBeTruthy()
        consoleMock.mockRestore()
    })
    it('preserves build stream.', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        const bs = new BuildStream('test')
        bs.src(__srcGlob).copy({src: '*', dest: './dummy'}, {dryRun: true})
        const files: string[] = []
        bs.peek(file => files.push(file.basename))
        await pEvent(bs.stream, 'finish')
        expect(files).toEqual(__srcFiles)
    })
})

describe('.clear()', () => {
    it('remove all the files int the build stream.', async () => {
        const bs = new BuildStream('test')
        const files: string[] = []
        bs.src(__srcGlob).peek(file => files.push(file.basename))
        await pEvent(bs.stream, 'finish')
        expect(files).toEqual(__srcFiles)

        files.splice(0)
        bs.clear().peek(file => files.push(file.basename))
        expect(files.length).toBe(0)
    })
})
