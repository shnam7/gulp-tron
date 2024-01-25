import { describe, expect, it, test, vi } from 'vitest'
import { BuildStream } from '../src/core/buildSream.js'

describe('.constructor', () => {
    it('can be created with no argument', () => {
        const bs = new BuildStream()
        expect(bs).toBeInstanceOf(BuildStream)
    })

})

describe('.className', () => {
    const bs = new BuildStream()
    it('should be "BuildStream', () => {
        expect(bs.className).toBe('BuildStream')
    })

})
