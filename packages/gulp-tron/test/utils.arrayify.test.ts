import {expect, test} from 'vitest'
import {arrayify} from '../src/utils/arrayify.js'

test('array to array: [] --> []', () => {
    expect(JSON.stringify(arrayify([]))).toBe('[]')
})

test('undefined to array: undefined --> []', () => {
    expect(JSON.stringify(arrayify())).toBe('[]')
})

test('false number(zero) to array: 0 --> [0]', () => {
    expect(JSON.stringify(arrayify(0))).toBe('[0]')
})

test('null to array: null --> [null]', () => {
    expect(JSON.stringify(arrayify(null))).toBe('[null]')
})

test(`empty string array: '' --> ['']`, () => {
    expect(JSON.stringify(arrayify(''))).toBe(`[""]`)
})

test(`string to array: 'a' --> ['a']`, () => {
    expect(JSON.stringify(arrayify('a'))).toBe(`["a"]`)
})

test(`string array to array: ['a'] --> ['a']`, () => {
    expect(JSON.stringify(arrayify(['a']))).toBe(`["a"]`)
})
