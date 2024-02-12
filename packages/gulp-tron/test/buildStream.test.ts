import { describe, expect, it, test, vi } from 'vitest'
import { BuildStream, cloneStream } from '../src/index.js'


describe('.constructor', () => {
    it('can be created with no argument.', () => {
        const bs = new BuildStream()
        expect(bs).instanceOf(BuildStream)
        expect(bs.name).toBe('<annonymous>')
    })

})

describe('.className', () => {
    const bs = new BuildStream()
    it('should be "BuildStream', () => {
        expect(bs.className).toBe('BuildStream')
    })

})

