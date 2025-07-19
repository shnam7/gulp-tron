import {Transform, PassThrough} from 'node:stream'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import {BuildStream} from '../src/build-stream.js'

// Mock all external dependencies
vi.mock('browser-sync', () => ({
    default: {
        active: false,
        stream: vi.fn(() => new PassThrough({objectMode: true})),
    },
}))

vi.mock('del', () => ({
    deleteSync: vi.fn(() => []),
}))

vi.mock('globby', () => ({
    globbySync: vi.fn(() => []),
}))

vi.mock('../src/globals.js', () => ({
    gulp: {
        src: vi.fn(() => new PassThrough({objectMode: true})),
        dest: vi.fn(() => new PassThrough({objectMode: true})),
    },
}))

vi.mock('gulp-debug2', () => ({
    default: vi.fn(() => new PassThrough({objectMode: true})),
}))

vi.mock('../src/utils/exec.js', () => ({
    exec: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('gulp-filter', () => ({
    default: vi.fn(() => new PassThrough({objectMode: true})),
}))

vi.mock('gulp-rename', () => ({
    default: vi.fn(() => new PassThrough({objectMode: true})),
}))

vi.mock('gulp-order3', () => ({
    default: vi.fn(() => new PassThrough({objectMode: true})),
}))

vi.mock('gulp-changed', () => ({
    default: vi.fn(() => new PassThrough({objectMode: true})),
    compareLastModifiedTime: vi.fn(),
    compareContents: vi.fn(),
}))

vi.mock('../src/utils/copy.js', () => ({
    copy: vi.fn(async () => {}),
    copyFilesByGlobs: vi.fn(() => ({copied: 0, skipped: 0, errors: 0})),
}))

vi.mock('../src/utils/exec.js', () => ({
    exec: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('node:fs', () => ({
    copyFileSync: vi.fn(),
}))

describe('BuildStream', () => {
    let buildStream: BuildStream

    beforeEach(() => {
        vi.clearAllMocks()
        buildStream = new BuildStream('test-stream')
    })

    describe('Core Functionality', () => {
        it('should create BuildStream instance with name and options', () => {
            const bs = new BuildStream('test', {dest: './dist', sourcemaps: true})
            expect(bs.name).toBe('test')
            expect(bs.opts.dest).toBe('./dist')
            expect(bs.opts.sourcemaps).toBe(true)
            expect(bs.stream).toBeInstanceOf(PassThrough)
        })

        it('should handle static methods', () => {
            expect(BuildStream.nullStream()).toBeInstanceOf(Transform)
            expect(BuildStream.create()).toBeInstanceOf(BuildStream)
            expect(BuildStream.builder()).toBeDefined()
        })

        it('should have performance and sync properties', () => {
            expect(typeof buildStream.performance.startTime).toBe('number')
            expect(typeof buildStream.performance.elapsedTime).toBe('number')
            expect(buildStream.sync).toBeInstanceOf(Promise)
            expect(typeof buildStream.logger).toBe('function')
        })
    })

    describe('Stream Operations', () => {
        it('should handle builder pattern methods', () => {
            expect(buildStream.src('**/*.js')).toBe(buildStream)
            expect(buildStream.src(['**/*.js', '**/*.ts'])).toBe(buildStream)
            expect(buildStream.add('**/*.css')).toBe(buildStream)
            expect(buildStream.dest('./dist')).toBe(buildStream)
        })

        it('should handle filtering and transformation', () => {
            expect(buildStream.filter('**/*.js')).toBe(buildStream)
            expect(buildStream.rename('newname.js')).toBe(buildStream)
            expect(buildStream.order(['vendor/**', 'app/**'])).toBe(buildStream)
            expect(buildStream.changed('./dist')).toBe(buildStream)
        })

        it('should handle stream management', () => {
            expect(buildStream.clear()).toBe(buildStream)
            expect(buildStream.clone('cloned-stream')).toBeInstanceOf(BuildStream)

            const mockTransform = new Transform({objectMode: true})
            expect(buildStream.pipe(mockTransform)).toBe(buildStream)

            const mockFunc = vi.fn()
            expect(buildStream.chain(mockFunc)).toBe(buildStream)
            expect(mockFunc).toHaveBeenCalledWith(buildStream)
        })

        it('should throw error when piping function', () => {
            expect(() => buildStream.pipe(vi.fn() as any)).toThrow()
        })
    })

    describe('File Operations', () => {
        it('should handle del method', () => {
            expect(buildStream.del('**/*.tmp')).toBe(buildStream)
        })

        it('should handle clean method', () => {
            const bs = new BuildStream('test', {clean: ['./dist/**']})
            expect(bs.clean()).toBe(bs)
        })

        it('should handle copy method with simple parameters', () => {
            expect(buildStream.copy({src: 'src/**/*.js', dest: './dist'})).toBe(buildStream)
        })

        it('should handle copy method with CopyParam object', () => {
            const copyParam = {src: 'src/**/*.js', dest: './dist'}
            expect(buildStream.copy(copyParam)).toBe(buildStream)
        })
    })

    describe('Process Execution', () => {
        it('should handle exec method', () => {
            expect(buildStream.exec('echo test')).toBe(buildStream)
        })

        it('should handle command execution and return BuildStream', () => {
            expect(buildStream.exec('echo "test command"')).toBe(buildStream)
        })
    })

    describe('Logging and Debugging', () => {
        it('should handle debug and log methods', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
            expect(buildStream.debug('debug message')).toBe(buildStream)
            expect(buildStream.log('test message')).toBe(buildStream)
            expect(consoleSpy).toHaveBeenCalledWith('test-stream::test message')
            consoleSpy.mockRestore()
        })

        it('should handle reload method', () => {
            expect(buildStream.reload()).toBe(buildStream)
        })
    })

    describe('Promise and Async Operations', () => {
        it('should handle promise method with function', async () => {
            const mockFunc = vi.fn(() => 'result')
            const result = buildStream.promise(mockFunc)
            expect(result).toBe(buildStream)

            await buildStream.sync
            expect(mockFunc).toHaveBeenCalled()
        })

        it('should execute build function', async () => {
            const buildFunc = vi.fn()
            const bs = new BuildStream('test')
            const result = await bs._main(buildFunc)
            expect(buildFunc).toHaveBeenCalledWith(bs)
            expect(result).toBe(bs.stream)
        })
    })

    describe('Utility Methods', () => {
        it('should handle intercept and peek methods', () => {
            const interceptFunc = vi.fn()
            const peekFunc = vi.fn()
            expect(buildStream.intercept(interceptFunc)).toBe(buildStream)
            expect(buildStream.peek(peekFunc)).toBe(buildStream)
        })

        it('should handle remove method variations', () => {
            expect(buildStream.remove('**/*.min.js')).toBe(buildStream)
            expect(buildStream.remove(['**/*.min.js', '**/*.min.css'])).toBe(buildStream)
        })

        it('should handle stream events with on method', () => {
            const eventHandler = vi.fn()
            expect(buildStream.on('end', eventHandler)).toBe(buildStream)
        })
    })

    describe('Integration Tests', () => {
        it('should handle complex method chaining', () => {
            const result = buildStream
                .src(['src/**/*.js', 'src/**/*.ts'])
                .filter('**/*.js')
                .order(['vendor/**', 'src/**'])
                .dest('./dist')
                .clean()
                .log('Build complete')

            expect(result).toBe(buildStream)
        })

        it('should handle integration test scenario', () => {
            const buildFunc = (bs: BuildStream) => {
                bs.src('src/**/*.js')
                    .filter('!**/*.min.js')
                    .dest('./dist')
                    .copy({src: 'assets/**/*', dest: './dist/assets'})
                    .clean(['temp/**'])
                    .exec('echo "Build complete"')
                    .log('Pipeline finished')
            }

            const bs = new BuildStream('integration-test')
            expect(() => {
                buildFunc(bs)
            }).not.toThrow()
        })

        it('should handle error scenarios and edge cases', () => {
            // Test empty src
            const bs = new BuildStream('test', {})
            expect(bs.src()).toBe(bs)

            // Test with various filter patterns
            buildStream.filter(['!**/*.min.js'])
            buildStream.filter([])

            // Test changed with different options
            buildStream.changed('./dist', {extension: '.min.js'})

            expect(buildStream).toBeInstanceOf(BuildStream)
        })
    })
})
