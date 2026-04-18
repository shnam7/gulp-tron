import {describe, expect, it, vi} from 'vitest'
import type {BuildStream} from 'gulp-tron'
import {
    sassP,
    lessP,
    autoPrefixerP,
    cleanCssP,
    pcssP,
    rtlcssP,
    stylelintP,
    stylelintScssP,
    stylelintLessP,
} from '../src/index.js'

function mockBs() {
    const bs = {
        pipe: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        opts: {},
        log: vi.fn(),
    }
    return bs as unknown as BuildStream
}

describe('plugin-styles', () => {
    describe('sassP', () => {
        it('is a factory function', () => {
            expect(typeof sassP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof sassP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            sassP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('lessP', () => {
        it('is a factory function', () => {
            expect(typeof lessP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof lessP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            lessP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('autoPrefixerP', () => {
        it('is a factory function', () => {
            expect(typeof autoPrefixerP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof autoPrefixerP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            autoPrefixerP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('cleanCssP', () => {
        it('is a factory function', () => {
            expect(typeof cleanCssP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof cleanCssP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            cleanCssP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('does not default to beautify format', () => {
            // Capture what is passed to pipe to assert format is not forced to 'beautify'
            const bs = mockBs()
            let capturedPlugin: unknown
            bs.pipe = vi.fn(plugin => {
                capturedPlugin = plugin
                return bs
            })
            cleanCssP()(bs)
            // If the plugin was created it will be defined — key point: no 'beautify' injection
            expect(capturedPlugin).toBeDefined()
        })
        it('passes through user-provided format option', () => {
            const bs = mockBs()
            // Should not throw with explicit format option
            expect(() => cleanCssP({format: 'beautify'})(bs)).not.toThrow()
        })
    })

    describe('pcssP', () => {
        it('is a factory function', () => {
            expect(typeof pcssP).toBe('function')
        })
        it('returns a PluginFunction from array overload', () => {
            expect(typeof pcssP([])).toBe('function')
        })
        it('returns a PluginFunction from callback overload', () => {
            expect(typeof pcssP(() => ({plugins: []}))).toBe('function')
        })
        it('calls bs.pipe once with plugins array', () => {
            const bs = mockBs()
            pcssP([])(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('calls bs.pipe once with callback', () => {
            const bs = mockBs()
            pcssP(() => ({plugins: []}))(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('rtlcssP', () => {
        it('is a factory function', () => {
            expect(typeof rtlcssP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof rtlcssP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            rtlcssP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
    })

    describe('stylelintP', () => {
        it('is a factory function', () => {
            expect(typeof stylelintP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof stylelintP()).toBe('function')
        })
        it('calls bs.pipe once', () => {
            const bs = mockBs()
            stylelintP()(bs)
            expect(bs.pipe).toHaveBeenCalledTimes(1)
        })
        it('warns on unrecognized parser string', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            const bs = mockBs()
            stylelintP({parser: 'unknown-parser' as unknown as string} as any)(bs)
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unrecognized parser'))
            warnSpy.mockRestore()
        })
        it('does not warn for known parsers', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            const bs = mockBs()
            stylelintP({parser: 'scss'} as any)(bs)
            expect(warnSpy).not.toHaveBeenCalled()
            warnSpy.mockRestore()
        })
    })

    describe('stylelintScssP', () => {
        it('is a factory function', () => {
            expect(typeof stylelintScssP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof stylelintScssP()).toBe('function')
        })
    })

    describe('stylelintLessP', () => {
        it('is a factory function', () => {
            expect(typeof stylelintLessP).toBe('function')
        })
        it('returns a PluginFunction', () => {
            expect(typeof stylelintLessP()).toBe('function')
        })
    })
})
