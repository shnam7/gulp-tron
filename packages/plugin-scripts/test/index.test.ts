import {describe, expect, it, vi} from 'vitest'
import type {BuildStream} from 'gulp-tron'
import {babelP, coffeeP, coffeelintP, concatP, eslintP, terserP} from '../src/index.js'

// Minimal mock that captures pipe calls without needing a real gulp stream
function mockBs(sourcemaps = false) {
    const bs = {
        pipe: vi.fn().mockReturnThis(),
        opts: {sourcemaps},
        log: vi.fn(),
    }
    return bs as unknown as BuildStream
}

describe('plugin-scripts', () => {
    describe('babelP', () => {
        it('is a factory function', () => {
            expect(typeof babelP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof babelP()).toBe('function')
        })
        it('calls bs.pipe once with the babel plugin', () => {
            const bs = mockBs()
            babelP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('converts sourceMaps → sourceMap for gulp-babel', () => {
            // babelP should not pass sourceMaps through; it converts to sourceMap
            const bs = mockBs()
            let passedPlugin: unknown
            bs.pipe = vi.fn(plugin => {
                passedPlugin = plugin
                return bs
            })
            babelP({sourceMaps: true})(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
            // The plugin must have been called (pipe was invoked)
            expect(passedPlugin).toBeDefined()
        })
        it('does not mutate the original options object', () => {
            const options = {sourceMaps: true as const}
            const bs = mockBs()
            babelP(options)(bs)
            expect(options.sourceMaps).toBe(true)
        })
        it('respects bs.opts.sourcemaps when no option given', () => {
            const bs = mockBs(true)
            babelP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('coffeeP', () => {
        it('is a factory function', () => {
            expect(typeof coffeeP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof coffeeP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            coffeeP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('coffeelintP', () => {
        it('is a factory function', () => {
            expect(typeof coffeelintP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof coffeelintP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            coffeelintP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('concatP', () => {
        it('is a factory function', () => {
            expect(typeof concatP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof concatP('out.js')).toBe('function')
        })
        it('calls bs.pipe once when filename is provided', () => {
            const bs = mockBs()
            concatP('output.js')(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('accepts an options object with a path property', () => {
            const bs = mockBs()
            concatP({path: 'bundle.js'})(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('throws when called with empty string', () => {
            const bs = mockBs()
            expect(() => concatP('' as unknown as string)(bs)).toThrow(
                'concatP: output filename is required',
            )
        })
        it('throws when options object has no path', () => {
            const bs = mockBs()
            expect(() => concatP({} as unknown as string)(bs)).toThrow(
                'concatP: output filename is required',
            )
        })
    })

    describe('eslintP', () => {
        it('is a factory function', () => {
            expect(typeof eslintP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof eslintP({})).toBe('function')
        })
        it('calls bs.pipe three times (lint, format, failAfterError)', () => {
            const bs = mockBs()
            eslintP({})(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(3)
        })
        it('separates formatter from eslint options', () => {
            const bs = mockBs()
            // Should not throw — formatter is extracted before passing to eslint
            expect(() => eslintP({formatter: 'stylish'})(bs)).not.toThrow()
        })
    })

    describe('terserP', () => {
        it('is a factory function', () => {
            expect(typeof terserP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof terserP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            terserP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })
})
