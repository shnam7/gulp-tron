import {fileURLToPath} from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import {Transform} from 'node:stream'
import {type MockInstance, afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type Vinyl from 'vinyl'
import {pEvent} from 'p-event'
import {src} from 'gulp'
import {Semaphore} from '@wicle/mutex'
import filter from 'gulp-filter'
import {BuildStream} from '../src/core/build-stream.js'
import {gulp} from '../src/core/globals.js'
import {type DestOptions, type SrcOptions, type TaskOptions} from '../src/core/types.js'

const __pathname = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__pathname)
const __srcGlob = path.join(__dirname, '../src/core/*.ts')

// const aFile = new Vinyl({
//     cwd: __dirname,
//     base: __dirname,
//     path: path.join(__dirname, 'foo.js'),
//     stat: fs.statSync(__pathname),
//     contents: Buffer.from('Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'),
// })

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
        expect(bs.options.src).toBe(conf.src)
        expect(bs.promiseSync).toBeInstanceOf(Promise)
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
        expect(resultGlob).toBe(bs.options.src)
    })
    it('can override TaskConf.src(default glob).', () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const srcOverride = './src/utils'
        bs.src(srcOverride)
        expect(srcMock).toHaveBeenCalledTimes(1)
        expect(resultGlob).not.toBe(bs.options.src)
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

    it('calls this.order() when order option is given.', async () => {
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

// describe('.addSrc()', () => {
//     it('add globs to stream when the stream is null - .src() never called earlier.', async () => {
//         const bs = new BuildStream()
//         bs.addSrc(__srcGlob).peek((file: Vinyl) => {
//             console.log(`---111`, file.basename)
//         })
//         await pEvent(bs.stream, 'finish')
//     })
// })

describe('.changed()', () => {
    it('does not pipe to gulp-changed if destination is not valid.', async () => {
        const bs = new BuildStream('test', {src: __srcGlob})
        const pipeMock = vi.spyOn(bs, 'pipe')
        bs.src().changed()
        await pEvent(bs.stream, 'finish')
        expect(pipeMock).toHaveBeenCalledTimes(1) // 1 time call inside src()
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

    it('uses TaskConfig.dest as default destination.', async () => {
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
        expect(folder).toBe(bs.options.dest)
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
        sequence.splice(0, sequence.length) // clear array
        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
        for (let i = 0; i < 100; i++) bs.promise(() => sequence.push(i))
        await bs.promiseSync
        for (let i = 0; i < 100; i++) expect(sequence[i]).toBe(i)
    })

    it('accept promise.', async () => {
        sequence.splice(0, sequence.length)
        const bs = new BuildStream('test', {src: __srcGlob})
        let i = 0
        const promisePush = async () =>
            new Promise<void>(res => {
                sequence.push(i++)
                res()
            })
        bs.src()
        for (let i = 0; i < 100; i++) bs.promise(promisePush())
        await bs.promiseSync
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

describe('.filter()', () => {
    it('filters files in the stream.', async () => {
        const allFiles: string[] = []
        const tFiles: string[] = []

        const bs = new BuildStream('test', {src: __srcGlob})
        bs.src()
            .peek((file: Vinyl) => allFiles.push(file.basename))
            .filter('t*.ts')
            .peek((file: Vinyl) => tFiles.push(file.basename))
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
            .peek((file: Vinyl) => renamedFiles.push(file.basename))
        await pEvent(bs.stream, 'finish')

        expect(renamedFiles.length).toBe(4)
        for (const file of renamedFiles) {
            expect(file.endsWith('ts-renamed')).toBeTruthy()
        }
    })
})

// describe('.changed()', () => {
//     it('does not pipe to gulp-changed if destination is not valid.', async () => {
//     })
// })

// describe('.src()', () => {
//     const bs = new BuildStream('test', {src: './src/core/*.ts'})
//     it('use TaskConf.src property as default.', async () => {
//         let globString
//         const glupSrc = gulp.src
//         const srcMock = vi.spyOn(gulp, 'src').mockImplementation((globs: string | string[]) => {
//             globString = globs
//             // return BuildStream.nullStream()
//             return glupSrc(globs)
//         })
//         const destMock = vi.spyOn(gulp, 'dest')
//         const files: string[] = []
//         bs.src()
//             .peek((file: Vinyl) => {
//                 files.push(file.basename)
//             })
//             .dest()
//         await pEvent(bs.stream, 'finish')

//         expect(srcMock).toHaveBeenCalledTimes(1)
//         expect(destMock).toHaveBeenCalledTimes(1)
//         expect(globString).toBe(bs.options.src)

//         srcMock.mockRestore()
//         destMock.mockRestore()

//         expect(files.length).toBe(4)
//         console.log(`---11`, files)
//     })
// })
