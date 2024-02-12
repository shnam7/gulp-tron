import { describe, expect, it } from 'vitest'
import tron, { BuildStream } from 'gulp-tron'
import { imageminP } from '../src/index.js'

describe('imagemin', () => {
    it('is a function.', () => {
        expect(typeof imageminP).toBe('function')
    })
    it('can be piped to BuildStream.', () => {
        const bs = new BuildStream('test')
        expect(bs.pipe(imageminP())).toBeInstanceOf(BuildStream)
    })
})
