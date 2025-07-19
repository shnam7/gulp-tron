import {describe, expect, it} from 'vitest'
import arrayify from '../src/utils/arrayify.js'

describe('arrayify', () => {
    it('should return empty array for undefined', () => {
        expect(arrayify(undefined)).toEqual([])
        expect(arrayify()).toEqual([])
    })

    it('should return the same array when input is already an array', () => {
        const inputArray = [1, 2, 3]
        expect(arrayify(inputArray)).toBe(inputArray)
    })

    it('should wrap single values in an array', () => {
        expect(arrayify('hello')).toEqual(['hello'])
        expect(arrayify(42)).toEqual([42])
        expect(arrayify(true)).toEqual([true])
        expect(arrayify(null)).toEqual([null])
    })

    it('should handle falsy values correctly', () => {
        expect(arrayify(0)).toEqual([0])
        expect(arrayify('')).toEqual([''])
        expect(arrayify(false)).toEqual([false])
    })
})
