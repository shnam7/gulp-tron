import { describe, expect, it, test, vi } from 'vitest'
import { GBuilder } from '../src/core/builder.js'
import { CopyBuilder } from '../src/core/copyBuilder.js'
import debug from 'gulp-debug'

describe('TBuilder', () => {
    const builder = new GBuilder()

    it('should be able to create instance.', () => {
        expect(builder.className).toBe('GBuilder')
        expect(builder.className).toBe(builder.constructor.name)
    })

    describe('(basic properties):', () => {
        it('should have className property.', () => {
            expect(builder.className).toBe('GBuilder')
        })
        it('should have name property.', () => {
            expect(builder.name).toBeDefined()
        })
        it('should have displayName property.', () => {
            expect(builder.displayName).toBeDefined()
        })
        it('should have stream property.', () => {
            expect(builder.stream.constructor.name).toBe('DestroyableTransform')
        })
    })

    describe('.buildProcess()', () => {
        it('should have __create() method.', () => {
            expect(builder).toHaveProperty('__create')
        })
        it('should have buildProcess() method.', () => {
            expect(builder).toHaveProperty('buildProcess')
        })
        it('should be executable.', async () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})    // depress console message
            builder.__create({ name: 'sample', verbose: true })
            await builder.buildProcess()
            expect(logSpy).toHaveBeenCalledTimes(1)
            logSpy.mockRestore()
        })
    })

    // describe('.createGulpTask', () => {
    //     it('should create valid gulp task with conf.builder=TBuilder.', () => {
    //         const conf = { name: 'build1', builder: 'TBuilder' }
    //         builder.createGulpTask(conf)
    //         const task = gulp.task(conf.name)   // gulp task
    //         expect(task).toBeDefined()
    //         expect(task?.displayName).toBe(conf.name)
    //     })

    //     it('should work with conf.builder missing.', () => {
    //         const conf = { name: 'build1' }
    //         builder.createGulpTask(conf)
    //         expect(builder.className).toBe('TBuilder')

    //         const task = gulp.task(conf.name)   // gulp task
    //         expect(task).toBeDefined()
    //         expect(task?.displayName).toBe(conf.name)
    //     })

    //     // it('should work when conf.builder is class type, not string.', () => {
    //     //     const conf = { name: 'build1', builder: CopyBuilder }
    //     //     builder.createGulpTask(conf)
    //     //     expect(builder.className).toBe('CopyBuilder')

    //     //     const task = gulp.task(conf.name)   // gulp task
    //     //     expect(task).toBeDefined()
    //     //     expect(task?.displayName).toBe(conf.name)
    //     // })
    // })

    describe('gulp API:', () => {
        test('.src() should should create a valid stream', () => {
            expect(builder.stream.constructor.name).toBe('DestroyableTransform')
        })

        // test('.dest() should be callable', () => {
        //     expect(() => { builder.dest('') }).toThrowError('Invalid dest() folder argument')
        // })

        test('.debug() should display message properly', async () => {
            const msgs: string[] = []
            vi.spyOn(console, 'log').mockImplementation((msg: string) => {
                expect(msg.search('gulp-debug')).toBeGreaterThanOrEqual(0)
                msgs.push(msg)
            })

            builder.src('./package.json').debug()
            // await builder.streamPromise()
            await builder.buildProcess()
            expect(msgs).toHaveLength(2)
        })

        test('.pipe() should connect plugin onto the stream.', async () => {
            const msgs: string[] = []
            vi.spyOn(console, 'log').mockImplementation((msg: string) => {
                expect(msg.search('gulp-debug')).toBeGreaterThanOrEqual(0)
                msgs.push(msg)
            })

            builder.src('./package.json').pipe(debug())
            // await builder.streamPromise()
            await builder.buildProcess()
            expect(msgs).toHaveLength(2)
        })
    })
})

describe("CopyBuilder", () => {
    const copyOptions = { src: 'dummy', dest: 'dummy', verbose: true }
    const builder = new CopyBuilder()

    it('should be able to create its instance.', () => {
        expect(builder.className).toBe('CopyBuilder')
        expect(builder.className).toBe(builder.constructor.name)
    })

    it('should have build() method.', () => {
        expect(builder).toHaveProperty('_build')
    })

    it('.build() can be executed with verbose option.', () => {
        // vi.spyOn(console, 'log').mockImplementation(() => {})    // depress console message
        // const dummySrc = vi.spyOn(builder, 'src').mockImplementation((...args: any[]) => builder)
        // const dummyDest = vi.spyOn(builder, 'dest').mockImplementation((...args: any[]) => builder)
        // builder.__create(copyOptions)
        // builder.buildProcess(builder, copyOptions)
        // expect(dummySrc).toHaveBeenLastCalledWith(copyOptions.src)
        // expect(dummyDest).toHaveBeenLastCalledWith(copyOptions.dest)
    })
})
