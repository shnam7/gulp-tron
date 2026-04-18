import {describe, it, expect, beforeEach, vi, afterAll, afterEach} from 'vitest'
import gulp from 'gulp'
import browserSync from 'browser-sync'
import {Tron, series, parallel} from '../src/tron.js'
import {BuildStream} from '../src/build-stream.js'
import {type GulpTaskFunction, type GulpTaskName} from '../src/types.js'

// const gulpTaskList = new Map<string, GulpTaskFunction>()
// Mock all external dependencies
// vi.mock('gulp', () => ({
//     default: {
//         task: vi.fn((name, fn) => {
//             if (name !== undefined && fn === undefined) return gulpTaskList.get(name)
//             gulpTaskList.set(name, fn)
//         }),
//     },
// }))

// --- Utility functions
function execTask(taskName: GulpTaskName) {
    const wrapperTask = gulp.task(taskName)
    if (!wrapperTask) throw new Error(`Task "${taskName}" is not defined`)

    return wrapperTask(() => {})
}

describe('Tron', () => {
    let tron
    beforeEach(() => {
        tron = new Tron()
        // Reset tron instance for each test
        // const tasks = tron.selectTasksAll()
        // for (const task of tasks) {
        //     // Clear tasks by creating a fresh instance
        // }
    })
    afterAll(() => {
        vi.restoreAllMocks()
        tron = null
    })

    // it('should run tasks in series (async/await)', async () => {
    //     const calls: string[] = []
    //     const fn1 = () => {
    //         calls.push('one')
    //     }

    //     const fn2 = async () => {
    //         calls.push('two')
    //     }q

    //     tron.task('fn1', fn1)
    //     tron.task('fn2', fn2)

    //     tron.task({
    //         name: 'fnMain',
    //         build(bs) {
    //             calls.push('main')
    //         },
    //         dependsOn: 'fn1',
    //         triggers: 'fn2',
    //     })

    //     // const seriesTask = gulp.series(fn1, fn2)
    //     const seriesTask = gulp.task('fnMain')?.unwrap()
    //     await new Promise<void>((resolve, reject) => {
    //         seriesTask!(() => {
    //             resolve()
    //         })
    //     })
    //     expect(calls).toEqual(['one', 'two'])
    // })

    describe('task method', () => {
        it('should create a task with a string name and build function', async () => {
            const taskName = 'task1'
            let bsOptions
            const buildFunction = bs => {
                expect(bs).toBeInstanceOf(BuildStream)
                expect(bs.name).toBe(taskName)
                bsOptions = bs.opts
            }

            expect(tron.taskCount).toBe(0)
            const result = tron.task(taskName, buildFunction)
            expect(tron.taskCount).toBe(1)

            const taskWrapper = gulp.task(taskName)
            const mainFunc = gulp.task(taskName)?.unwrap()
            expect(result).toBe(tron)
            expect(tron.findTask(taskName)).toBeDefined()
            expect(taskWrapper).toBeDefined()
            expect(mainFunc).toBeDefined()
            expect(mainFunc?.name).toBe('main')
            await expect(execTask(taskName)).resolves.not.toThrow()
            expect(bsOptions).toEqual({name: taskName, build: buildFunction})
        })
        it('should create a task with a configuration object', async () => {
            let bsOptions
            const config = {
                name: 'task1',
                build(bs) {
                    expect(bs).toBeInstanceOf(BuildStream)
                    expect(bs.name).toBe(config.name)
                    bsOptions = bs.opts
                },
            }

            expect(tron.taskCount).toBe(0)
            tron.task(config)
            expect(tron.taskCount).toBe(1)
            expect(tron.findTask(config.name)).toBeDefined()

            await expect(execTask(config.name)).resolves.not.toThrow()
            expect(bsOptions).toEqual(config)
        })
        it('should create a task without a build function', async () => {
            const taskName = 'task1'

            expect(tron.taskCount).toBe(0)
            tron.task(taskName)
            expect(tron.taskCount).toBe(1)
            expect(tron.findTask(taskName)).toBeDefined()

            await expect(execTask(taskName)).resolves.not.toThrow()
        })
        it('should throw an error for invalid task names', () => {
            expect(() => tron.task('')).toThrow('Tron:task: invalid task name')
            expect(() => tron.task('invalid/name')).toThrow('Tron:task: invalid task name')
            expect(() => tron.task({name: String.raw`invalid\name`})).toThrow(
                'Tron:task: invalid task name',
            )
        })
        it('should throw an error for reserved task names', () => {
            expect(() => tron.task('@clean', () => {})).toThrow(
                `Tron:resolveTaskConfig: invalid task name: '@clean' is a reserved task name.`,
            )
            expect(() => tron.task('@watch', () => {})).toThrow(
                `Tron:resolveTaskConfig: invalid task name: '@watch' is a reserved task name.`,
            )
        })
        it('should handle duplicate task names without throwing', async () => {
            const taskName = 'task1'
            const messages: string[] = []

            expect(tron.taskCount).toBe(0)
            tron.task(taskName, bs => messages.push('first run'))
            await expect(execTask(taskName)).resolves.not.toThrow()
            expect(messages.length).toBe(1)
            expect(messages[0]).toBe('first run')

            // Create duplicate task
            expect(tron.taskCount).toBe(1)
            tron.task(taskName, bs => messages.push('second run'))
            expect(tron.taskCount).toBe(1)
            await expect(execTask(taskName)).resolves.not.toThrow()
            expect(messages.length).toBe(2)
            expect(messages[1]).toBe('second run')
        })
        it('should handle task dependencies and triggers', async () => {
            const mockSeries = vi.spyOn(gulp, 'series').mockImplementation((...args) => {
                for (const task of args)
                    if (typeof task === 'function') (task as unknown as any)(() => {})
                return () => {}
            })

            const taskNames: string[] = []
            const build = bs => taskNames.push(bs.name)
            expect(tron.taskCount).toBe(0)
            tron.task('depTask', build)
            tron.task('trigTask', build)
            tron.task({name: 'mainTask', build, dependsOn: 'depTask', triggers: 'trigTask'})
            expect(tron.taskCount).toBe(3)

            expect(taskNames).toEqual(expect.arrayContaining(['depTask', 'mainTask', 'trigTask']))

            mockSeries.mockRestore()
        })
        it('should handle series, parallel, and complex dependencies', () => {
            const mockSeries = vi.spyOn(gulp, 'series')
            const mockParallel = vi.spyOn(gulp, 'parallel')

            const taskNames: string[] = []
            const build = bs => taskNames.push(bs.name)
            expect(tron.taskCount).toBe(0)
            tron.task('t-dep-s1', build)
            tron.task('t-dep-s2', build)
            tron.task('t-trig-p1', build)
            tron.task('t-trig-p2', build)
            const dependsOn = tron.series('t-dep-s1', 't-dep-s2')
            const triggers = tron.parallel('t-trig-p1', 't-trig-p2')
            tron.task({name: 'mainTask', build, dependsOn, triggers})
            expect(tron.taskCount).toBe(5)

            expect(mockSeries).toHaveBeenCalledTimes(2)
            expect(mockParallel).toHaveBeenCalledTimes(1)

            mockSeries.mockRestore()
            mockParallel.mockRestore()
        })

        it('should handle edge cases for dependsOn and triggers', () => {
            const build = bs => {}
            // Empty buildSets
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'empty-dependencies', build, dependsOn: [], triggers: []})
            expect(tron.taskCount).toBe(1)
            expect(tron.findTask('empty-dependencies')).toBeDefined()

            // Only dependencies
            tron.task('dependsOn-only', () => {})
            tron.task({name: 'no-build-with-deps', dependsOn: 'dependsOn-only'})
            expect(tron.taskCount).toBe(3)
            expect(tron.findTask('no-build-with-deps')).toBeDefined()
        })
    })

    describe('createTasks method', () => {
        it('should create multiple tasks from an array of configurations', async () => {
            const taskConfigs = [
                {name: 'task1', build: bs => expect(bs.opts).toStrictEqual(taskConfigs[0])},
                {name: 'task2', build: bs => expect(bs.opts).toStrictEqual(taskConfigs[1])},
            ]

            expect(tron.taskCount).toBe(0)
            tron.createTasks(...taskConfigs)
            expect(tron.taskCount).toBe(2)

            await expect(execTask('task1')).resolves.not.toThrow()
            await expect(execTask('task2')).resolves.not.toThrow()
        })
        it('should handle empty configurations gracefully', () => {
            expect(() => tron.createTasks()).not.toThrow()
            expect(tron.selectTasksAll().length).toBe(0)
        })
        it('should handle single TaskConfig object', async () => {
            const taskConfig = {name: 'task1'}
            tron.createTasks(taskConfig)
            await expect(execTask(taskConfig.name)).resolves.not.toThrow()
        })
    })

    describe('addCleaner method', () => {
        let mockDel
        beforeEach(() => {
            mockDel = vi.spyOn(BuildStream.prototype, 'del')
        })
        afterEach(() => {
            mockDel.mockRestore()
        })

        it('should add a cleaner task', async () => {
            expect(tron.taskCount).toBe(0)
            tron.addCleaner({clean: ['dist']})
            expect(tron.taskCount).toBe(1)

            await expect(execTask('@clean')).resolves.not.toThrow()
            expect(mockDel).toHaveBeenCalledWith(['dist'], expect.any(Object))
        })
        it('should handle clean targets correctly', async () => {
            const conf1 = {name: 'task1', clean: ['dist1']}
            const conf2 = {name: 'task2', clean: ['dist2']}

            expect(tron.taskCount).toBe(0)
            tron.task(conf1)
            tron.task(conf2)
            tron.addCleaner({clean: ['dist3']})
            expect(tron.taskCount).toBe(3)

            await expect(execTask('@clean')).resolves.not.toThrow()
            expect(mockDel).toHaveBeenCalledWith(['dist3', 'dist1', 'dist2'], expect.any(Object))
        })
    })

    describe('addWatch method', () => {
        let mockWatch
        let mockBrowserSync
        beforeEach(() => {
            mockWatch = vi.spyOn(gulp, 'watch')
            mockBrowserSync = vi.spyOn(browserSync, 'init').mockImplementation(() => {
                return {} as unknown as browserSync.BrowserSyncInstance
            })
        })
        afterEach(() => {
            mockWatch.mockRestore()
            mockBrowserSync.mockRestore()
        })

        it('should add a watcher for src pattern', async () => {
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'src-task', src: 'src/**/*.js'})
            tron.addWatcher()
            expect(tron.taskCount).toBe(2)
            expect(tron.findTask('@watch')).toBeDefined()

            await expect(execTask('@watch')).resolves.not.toThrow()
            expect(mockWatch).toHaveBeenCalledWith(['src/**/*.js'], expect.any(Function))
        })
        it('should handle no matching targets', async () => {
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'task1', src: 'src/**/*.js'})
            tron.addWatcher({target: 'non-existent-*'})
            expect(tron.taskCount).toBe(2)

            await expect(execTask('@watch')).resolves.not.toThrow()
            expect(mockWatch).not.toHaveBeenCalled()
        })

        it('should add a watcher with custom name for watch pattern', async () => {
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'watch-task', watch: 'src/**/*.ts'})
            tron.addWatcher({name: 'watch-ts'})
            expect(tron.taskCount).toBe(2)
            expect(tron.findTask('watch-ts')).toBeDefined()

            await expect(execTask('watch-ts')).resolves.not.toThrow()
            expect(mockWatch).toHaveBeenCalledWith(['src/**/*.ts'], expect.any(Function))
        })

        it('should add a watcher for addWatch pattern', async () => {
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'addwatch-task', addWatch: 'src/**/*.css'})
            tron.addWatcher()
            expect(tron.taskCount).toBe(2)

            await expect(execTask('@watch')).resolves.not.toThrow()
            expect(mockWatch).toHaveBeenCalledWith(['src/**/*.css'], expect.any(Function))
        })

        it('should initialize browserSync if option is set', async () => {
            expect(tron.taskCount).toBe(0)
            tron.task({name: 'bs-task', src: 'src/**/*.js', build() {}})
            tron.addWatcher({browserSync: {server: 'public'}})
            expect(tron.taskCount).toBe(2)

            await expect(execTask('@watch')).resolves.not.toThrow()
            expect(mockBrowserSync).toHaveBeenCalledWith(
                expect.objectContaining({server: 'public'}),
            )
        })
    })

    describe('selectTasks method', () => {
        beforeEach(() => {
            tron.task('alpha')
            tron.task('beta')
            tron.task('gamma')
            tron.task('delta')
        })

        it('should return all tasks for * pattern', () => {
            const result = tron.selectTasks('*')
            expect(result.toSorted()).toEqual(['alpha', 'beta', 'gamma', 'delta'].toSorted())
        })
        it('should return matching tasks for prefix pattern', () => {
            expect(tron.taskCount).toBe(4)
            expect(tron.selectTasks('a*')).toEqual(['alpha'])
            expect(tron.selectTasks('b*')).toEqual(['beta'])
        })
        it('should return matching tasks for array of patterns', () => {
            const result = tron.selectTasks(['a*', 'g*'])
            expect(result.toSorted()).toEqual(['alpha', 'gamma'].toSorted())
        })
        it('should return empty array for no match', () => {
            expect(tron.selectTasks('zzz')).toEqual([])
        })
        it('should support negation pattern', () => {
            const result = tron.selectTasks(['!beta'])
            expect(result.toSorted()).toEqual(['alpha', 'gamma', 'delta'].toSorted())
        })
        it('should support multiple negation patterns', () => {
            let result = tron.selectTasks(['a*', 'g*', 'd*', '!g*'])
            expect(result.toSorted()).toEqual(['alpha', 'delta'].toSorted())

            // case starting with negation
            result = tron.selectTasks(['!g*', 'a*', 'd*'])
            expect(result.toSorted()).toEqual(['alpha', 'delta'].toSorted())
        })
        it('should support negation only patterns (all except)', () => {
            const result = tron.selectTasks(['!alpha', '!delta'])
            expect(result.toSorted()).toEqual(['beta', 'gamma'].toSorted())
        })

        it('should return empty array for undefined or empty input', () => {
            expect(tron.selectTasks()).toEqual([])
            expect(tron.selectTasks(undefined)).toEqual([])
        })

        it('should return empty array for empty array input', () => {
            expect(tron.selectTasks([])).toEqual([])
        })
    })

    describe('series and parallel methods', () => {
        it('should create a series task with multiple functions', () => {
            const seriesTasks = tron.series('task1', 'task2')
            expect(seriesTasks).toStrictEqual(expect.arrayContaining(['task1', 'task2']))
            const parallelTasks = tron.parallel('task1', 'task2')
            expect(parallelTasks).toStrictEqual(expect.objectContaining({set: ['task1', 'task2']}))
        })
    })
})
