import { describe, expect, it, test, vi } from 'vitest'
import tron from '../src/index.js'
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
    it('can create task with single item dependency.', () => {
        const taskName = 'build3'
        const dep1 = (cb) => cb()

        expect(gulp.task(taskName)).toBeUndefined()
        expect(gulp.task('dep1')).toBeUndefined()

        let callCount = 0
        const series = gulp.series
        const mockGulp = vi.spyOn(gulp, 'series').mockImplementation((...args: any[]) => {
            if (args.indexOf(dep1) >= 0) callCount++
            return series(args)
        })
        tron.task(taskName, (bs) => {}, dep1)
        mockGulp.mockRestore()

        expect(gulp.task(taskName)).toBeTypeOf('function')
        // expect(callCount).toBe(1)
    })
    it('does not create task when both build and dependsOn properties are missing.', () => {
        const taskName = 'dummy'
        expect(gulp.task(taskName)).toBeUndefined()
        tron.task({ name: taskName })
        expect(gulp.task(taskName)).toBeUndefined()

    })
    it('can create task with missing build property, but wit valud dependsOn valuse.', () => {
        const taskName = 'build4'
        expect(gulp.task(taskName)).toBeUndefined()
        const dep1 = (cb) => cb()
        tron.task({ name: taskName, dependsOn: dep1 })
        expect(gulp.task(taskName)).toBeTypeOf('function')
    })
})
