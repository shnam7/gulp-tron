import {describe, expect, it, vi} from 'vitest'
import gulp from 'gulp'
import {useGulp} from '../src/globals.js'

describe('globals', () => {
    describe('useGulp', () => {
        it('should accept a gulp instance', () => {
            expect(() => {
                useGulp(gulp)
            }).not.toThrow()
        })

        it('should accept a custom gulp-like object', () => {
            const mockGulp = {
                src: vi.fn(),
                dest: vi.fn(),
                task: vi.fn(),
                series: vi.fn(),
                parallel: vi.fn(),
                watch: vi.fn(),
            } as any

            expect(() => {
                useGulp(mockGulp)
            }).not.toThrow()
        })
    })

    describe('gulp export', () => {
        it('should export gulp with essential methods', async () => {
            const {gulp: exportedGulp} = await import('../src/globals.js')

            expect(exportedGulp).toBeDefined()
            expect(exportedGulp.src).toBeDefined()
            expect(exportedGulp.dest).toBeDefined()
            expect(exportedGulp.task).toBeDefined()
        })
    })
})
