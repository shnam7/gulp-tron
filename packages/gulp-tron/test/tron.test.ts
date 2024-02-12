import { describe, expect, it, test, vi } from 'vitest'
import tron, { BuildFunction, BuildStream, TaskConfig } from '../src/index.js'
import gulp from 'gulp'

describe('tell if function is GulpTaskFunction or BuildFunction', () => {
    test('does not accept null or undefined name in task config.', () => {
        expect(1).toBe(1)
    })

})

describe('.task', () => {
    it('does not accept null or undefined name in task config.', () => {
        expect(() => { tron.task('', () => {}) }).toThrowError()
        expect(() => { tron.task({ name: '' }) }).toThrowError()

        const taskCount = tron.selectTasksAll().length
        expect(() => { tron.createTasks({ name: 'aa' }, {}, {}) }).not.toThrowError()
        expect(tron.selectTasksAll().length).toBe(taskCount + 1)
    })

    it('can create task with build function.', () => {
        const taskName = 'build1'
        expect(gulp.task(taskName)).toBeUndefined()
        tron.task(taskName, (bs) => {})
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })

    it('can create task with build TaskConfig object.', () => {
        const taskName = 'build2'
        expect(gulp.task(taskName)).toBeUndefined()
        tron.task({ name: taskName, build: (bs) => {} })
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })
    it('can create task without build fuction and with no dependsOn/triggers properties.', () => {
        const taskName = 'dummy'
        expect(gulp.task(taskName)).toBeUndefined()
        tron.task({ name: taskName })
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })

    it('can create task with dependents.', () => {
        const task1 = (bs: BuildStream) => {}
        const task2 = (bs: BuildStream) => {}
        const task3 = (bs: BuildStream) => {}
        const task4 = (bs: BuildStream) => {}
        const task5 = (bs: BuildStream) => {}

        const taskConfig: TaskConfig = {
            name: 'build4',
            dependsOn: task1,
            triggers: tron.series(task2, tron.parallel(task3, task4), task5),
        }
        tron.task(taskConfig)

        const b4: TaskConfig | undefined = tron.findTask(taskConfig.name)
        expect(b4).not.toBeUndefined()
        const taskName = b4?.taskName
        expect(taskName).toBe(taskConfig.name)
        expect(gulp.task(taskName || '')).toBeInstanceOf(Function)

        const annonTasks = tron.selectTasks(/-task[1-5]$/)
        expect(annonTasks.length).toBe(5)
    })
})
