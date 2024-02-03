import { describe, expect, it } from 'vitest'
import tron, { BuildStream } from 'gulp-tron'
import imagemin from '../src/index.js'

describe('imagemin', () => {
    it('is a function.', () => {
        expect(typeof imagemin).toBe('function')
    })
    it('can be piped to BuildStream.', () => {
        const bs = new BuildStream
        expect(bs.pipe(imagemin())).toBeInstanceOf(BuildStream)
    })
})
