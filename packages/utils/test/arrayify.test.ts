import { describe, expect, it } from 'vitest'
import { arrayify } from '../src/index.js'

describe('arrayify', () => {
    it('should return array for string', () => {
        expect(arrayify("abc")).toMatchObject(['abc'])
    })
    it('should return []] for undefined', () => {
        expect(arrayify()).toMatchObject([])
        expect(arrayify(undefined)).toMatchObject([])
    })
    it('should return [] for null', () => {
        expect(arrayify(null)).toMatchObject([])
    })
    it('should return [{}] for {}', () => {
        expect(arrayify({})).toMatchObject([{}])
    })
    it('should return [] for []', () => {
        expect(arrayify([])).toMatchObject([])
    })
})
