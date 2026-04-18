import {describe, expect, it, vi} from 'vitest'
import type {BuildStream} from 'gulp-tron'
import {imageminP} from '../src/index.js'

function mockBs() {
    const bs = {
        pipe: vi.fn().mockReturnThis(),
        opts: {},
        log: vi.fn(),
    }
    return bs as unknown as BuildStream
}

describe('imageminP', () => {
    it('is a factory function', () => {
        expect(typeof imageminP).toBe('function')
    })
    it('returns a PluginFunction when called with no arguments', () => {
        expect(typeof imageminP()).toBe('function')
    })
    it('returns a PluginFunction when called with an options object', () => {
        expect(typeof imageminP({})).toBe('function')
    })
    it('returns a PluginFunction when called with an empty plugins array', () => {
        expect(typeof imageminP([])).toBe('function')
    })
    it('calls bs.pipe once with no arguments', () => {
        const bs = mockBs()
        imageminP()(bs)
        expect(bs.pipe).toHaveBeenCalledTimes(1)
    })
    it('calls bs.pipe once with plugins array', () => {
        const bs = mockBs()
        imageminP([])(bs)
        expect(bs.pipe).toHaveBeenCalledTimes(1)
    })
    it('calls bs.pipe once with options object', () => {
        const bs = mockBs()
        imageminP({})(bs)
        expect(bs.pipe).toHaveBeenCalledTimes(1)
    })
})
