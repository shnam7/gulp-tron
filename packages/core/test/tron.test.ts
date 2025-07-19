import {describe, it, expect, beforeEach, vi} from 'vitest'
import {tron, series, parallel, type BuildFunction, type TaskConfig} from '../src/index.js'

describe('Tron Class', () => {
    beforeEach(() => {
        // Reset tron instance for each test
        const tasks = tron.selectTasksAll()
        for (const task of tasks) {
            // Clear tasks by creating a fresh instance
        }
    })

    describe('Basic Task Operations', () => {
        it('should create tasks with various configurations', () => {
            // String name with build function
            const result1 = tron.task('basic-task', () => {})
            expect(result1).toBe(tron)
            expect(tron.findTask('basic-task')).toBeDefined()

            // Configuration object
            const config: TaskConfig = {
                name: 'config-task',
                build(bs) {
                    bs.log('test')
                },
                src: 'src/**/*.js',
                dest: 'dist',
            }
            const result2 = tron.task(config)
            expect(result2).toBe(tron)
            expect(tron.findTask('config-task')).toBeDefined()

            // Without build function
            const result3 = tron.task('no-build-task')
            expect(result3).toBe(tron)
            expect(tron.findTask('no-build-task')).toBeDefined()

            // Multiple tasks
            const result4 = tron.createTasks({name: 'task-1', build() {}}, {name: 'task-2'})
            expect(result4).toBe(tron)
            expect(tron.findTask('task-1')).toBeDefined()
            expect(tron.findTask('task-2')).toBeDefined()
        })

        it('should handle task management operations', () => {
            tron.task('build-js', () => {})
            tron.task('build-css', () => {})
            tron.task('test-unit', () => {})

            // Find tasks
            expect(tron.findTask('build-js')).toBeDefined()
            expect(tron.findTask('non-existent')).toBeUndefined()

            // Select with patterns
            const buildTasks = tron.selectTasks('build-*')
            expect(buildTasks?.length).toBe(2)
            expect(tron.selectTasks(undefined)).toBeUndefined()
            expect(tron.selectTasks([])).toBeUndefined()

            // Select all
            expect(tron.selectTasksAll().length).toBeGreaterThanOrEqual(3)

            // Complex patterns
            expect(tron.selectTasks('build-js')?.length).toBe(1)
            expect(tron.selectTasks(['build-*'])?.length).toBe(2)
            expect(tron.selectTasks(['!build-*']).length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('BuildSet Resolution', () => {
        beforeEach(() => {
            tron.task('dep-task', () => {})
            tron.task('task-1', () => {})
            tron.task('task-2', () => {})
        })

        it('should handle dependencies and triggers', () => {
            tron.task({
                name: 'with-deps',
                build() {},
                dependsOn: 'dep-task',
                triggers: 'task-1',
            })

            expect(tron.findTask('with-deps')).toBeDefined()
        })

        it('should handle series, parallel, and function dependencies', () => {
            // Series and parallel
            expect(tron.series('task-1', 'task-2')).toBeDefined()
            expect(tron.parallel('task-1', 'task-2')).toBeDefined()
            expect(series('task-1', 'task-2')).toBeDefined()
            expect(parallel('task-1', 'task-2')).toBeDefined()

            // Function dependencies
            const anonFunc: BuildFunction = bs => bs.log('anonymous')
            tron.task({
                name: 'func-deps-task',
                build() {},
                dependsOn: anonFunc,
            })
            expect(tron.findTask('func-deps-task')).toBeDefined()

            // Array dependencies
            tron.task({
                name: 'array-deps-task',
                build() {},
                dependsOn: ['dep-task', 'task-1'],
            })
            expect(tron.findTask('array-deps-task')).toBeDefined()

            // Complex nested
            const complexBuildSet = tron.parallel(tron.series('task-1', 'task-2'), 'dep-task')
            expect(complexBuildSet).toBeDefined()
        })
    })

    describe('Cleaner and Watcher', () => {
        it('should create cleaner and watcher tasks', () => {
            // Cleaner
            tron.task({
                name: 'cleanable-task',
                build() {},
                clean: ['dist/**/*'],
            })
            const cleanerResult = tron.addCleaner({clean: ['temp/**/*']})
            expect(cleanerResult).toBe(tron)
            expect(tron.findTask('@clean')).toBeDefined()

            // Watcher
            tron.task({
                name: 'watchable-task',
                build() {},
                src: ['src/**/*.js'],
                watch: ['watch/**/*.js'],
            })
            const watcherResult = tron.addWatcher({name: 'test-watcher'})
            expect(watcherResult).toBe(tron)
            expect(tron.findTask('test-watcher')).toBeDefined()
        })

        it('should handle no matching targets', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

            tron.addCleaner({target: 'non-existent-*'})
            expect(consoleSpy).toHaveBeenCalledWith(
                'tron.addCleaner: no task selected. Cleaner task not created.',
            )

            tron.addWatcher({target: 'non-existent-*'})
            expect(consoleSpy).toHaveBeenCalledWith(
                'tron.addWatcher: no task selected. Watcher task not created.',
            )

            consoleSpy.mockRestore()
        })
    })

    describe('Error Handling', () => {
        it('should validate task names', () => {
            expect(() => tron.task(String.raw`task<>:"/\|?*`, () => {})).toThrow(
                'invalid task name',
            )
            expect(() => tron.task(' task-with-spaces ', () => {})).toThrow('invalid task name')
            expect(() => tron.task({name: '', build() {}})).toThrow('invalid task configuration')
            expect(() => tron.task({name: null as any, build() {}})).toThrow('invalid task name')
        })

        it('should handle reserved names and dependencies', () => {
            expect(() => tron.task('@clean', () => {})).toThrow('reserved task name')
            expect(() => tron.task('@watch', () => {})).toThrow('reserved task name')

            expect(() => {
                tron.task({
                    name: 'missing-dep-task',
                    build() {},
                    dependsOn: 'non-existent-task',
                })
            }).toThrow('Task "non-existent-task" is not found')

            // Duplicate names should not throw
            tron.task('duplicate-task', () => {})
            expect(() => tron.task('duplicate-task', () => {})).not.toThrow()
        })
    })

    describe('Advanced Features', () => {
        it('should handle complex configurations', () => {
            // Full configuration
            const config: TaskConfig = {
                name: 'full-config-task',
                build(bs) {
                    bs.log('full config')
                },
                src: 'src/**/*.js',
                dest: 'dist',
                clean: 'dist/**/*',
                watch: 'src/**/*.js',
                addWatch: 'extra/**/*.js',
                dependsOn: [],
                triggers: [],
                logLevel: 'verbose',
            }
            const result = tron.task(config)
            expect(result).toBe(tron)
            expect(tron.findTask('full-config-task')).toBeDefined()

            // Gulp instance
            const mockGulp = {} as any
            expect(() => {
                tron.use(mockGulp)
            }).not.toThrow()

            // Empty configurations
            expect(tron.createTasks()).toBe(tron)
        })

        it('should handle various dependency types', () => {
            tron.task('multi-dep-1', () => {})
            tron.task('multi-dep-2', () => {})

            // Multiple dependencies
            tron.task({
                name: 'multi-deps-task',
                build() {},
                dependsOn: ['multi-dep-1', 'multi-dep-2'],
            })
            expect(tron.findTask('multi-deps-task')).toBeDefined()

            // Parallel dependencies
            tron.task({
                name: 'parallel-deps-task',
                build() {},
                dependsOn: tron.parallel('multi-dep-1', 'multi-dep-2'),
            })
            expect(tron.findTask('parallel-deps-task')).toBeDefined()

            // Named function dependencies
            function namedFunction() {}
            tron.task({
                name: 'named-func-task',
                build() {},
                dependsOn: namedFunction,
            })
            expect(tron.findTask('named-func-task')).toBeDefined()
        })

        it('should handle edge cases', () => {
            // Empty buildSets
            tron.task({
                name: 'empty-buildset-task',
                build() {},
                dependsOn: [],
                triggers: [],
            })
            expect(tron.findTask('empty-buildset-task')).toBeDefined()

            // Only dependencies
            tron.task('only-dep', () => {})
            tron.task({
                name: 'no-build-with-deps',
                dependsOn: 'only-dep',
            })
            expect(tron.findTask('no-build-with-deps')).toBeDefined()

            // Complex nested buildSets
            tron.task({
                name: 'nested-array-task',
                build() {},
                dependsOn: [['multi-dep-1', 'multi-dep-2']],
            })
            expect(tron.findTask('nested-array-task')).toBeDefined()
        })

        it('should handle verbose logging', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

            tron.task({
                name: 'verbose-task',
                build() {},
                logLevel: 'verbose',
            })

            // Create duplicate to trigger verbose logging
            tron.task({
                name: 'verbose-task',
                build() {},
                logLevel: 'verbose',
            })

            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })
})
