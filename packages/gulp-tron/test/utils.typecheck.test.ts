import { describe, expect, it, test } from 'vitest'
import is from '../src/utils/typecheck.js'

describe('is', () => {
    describe('Array()', () => {
        test('[] is array', () => {
            expect(is.Array([])).toBeTruthy()
        })
        test('{}} is not array', () => {
            expect(is.Array({})).toBeFalsy()
        })
    })

    describe('Object()', () => {
        test('{} is object', () => {
            expect(is.Object({})).toBeTruthy()
        })
        test('function is not object.', () => {
            expect(is.Object(() => {})).toBeFalsy()
        })
        test('array is not object.', () => {
            expect(is.Object([])).toBeFalsy()
            expect(is.Object(new Array(1))).toBeFalsy()
        })
        test('string is not object.', () => {
            expect(is.Object("abc")).toBeFalsy()
            expect(is.Object(new String("abc"))).toBeFalsy()
        })
        test('class is not object.', () => {
            class A {}
            expect(is.Object(A)).toBeFalsy()
        })
    })

    describe('Function()', () => {
        test('() => {} is function', () => {
            expect(is.Function(() => {})).toBeTruthy()
        })
        test('arg => {} is function', () => {
            expect(is.Function(arg => {})).toBeTruthy()
        })
        test('function () {} is function', () => {
            expect(is.Function(function() {})).toBeTruthy()
        })
        test('object is not function', () => {
            expect(is.Function({})).toBeFalsy()
        })
        test('class is not function', () => {
            class A {}
            expect(is.Function(A)).toBeFalsy()
        })
    })

    describe('String()', () => {
        test('"abc" is string', () => {
            expect(is.String("abc")).toBeTruthy()
        })
        test('String("abc") is string', () => {
            expect(is.String(new String("abc"))).toBeTruthy()
        })
    })
    describe('Number()', () => {
        test('123 is number', () => {
            expect(is.Number(123)).toBeTruthy()
        })
        test('123.456 is number', () => {
            expect(is.Number(123.456)).toBeTruthy()
        })
        test('"123.456" is not number', () => {
            expect(is.Number("123.456")).toBeFalsy()
        })
    })
})
