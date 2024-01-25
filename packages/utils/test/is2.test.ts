import { describe, expect, it, test } from 'vitest'
import is from 'is'

describe('is', () => {
    describe('.array()', () => {
        test('[] is array', () => {
            expect(is.array([])).toBeTruthy()
        })
        test('{}} is not array', () => {
            expect(is.array({})).toBeFalsy()
        })
    })

    describe('.object()', () => {
        test('{} is object', () => {
            expect(is.object({})).toBeTruthy()
        })
        test('function is not object.', () => {
            expect(is.object(() => {})).toBeFalsy()
        })
        test('array is not object.', () => {
            expect(is.object([])).toBeFalsy()
            expect(is.object(new Array(1))).toBeFalsy()
        })
        test('string is not object.', () => {
            expect(is.object("abc")).toBeFalsy()
            expect(is.object(new String("abc"))).toBeFalsy()
        })
        test('class is not object.', () => {
            class A {}
            expect(is.object(A)).toBeFalsy()
        })
    })

    describe('.fn()', () => {
        test('() => {} is function', () => {
            expect(is.fn(() => {})).toBeTruthy()
        })
        test('arg => {} is function', () => {
            expect(is.fn(arg => {})).toBeTruthy()
        })
        test('function () {} is function', () => {
            expect(is.fn(function() {})).toBeTruthy()
        })
        test('object is not function', () => {
            expect(is.fn({})).toBeFalsy()
        })
        // test('class {} is not function', () => {
        //     class A {}
        //     expect(is.function(A)).toBeFalsy()
        // })
        test('() => {} is instance of Object', () => {
            class A {}
            expect(is.instance(() => {}, Object)).toBeTruthy()
            expect(is.instance(() => {}, A)).toBeFalsy()
        })
    })

    describe('.string()', () => {
        test('"abc" is string', () => {
            expect(is.string("abc")).toBeTruthy()
        })
        test('String("abc") is string', () => {
            expect(is.string(new String("abc"))).toBeTruthy()
        })
    })
    describe('.number()', () => {
        test('123 is number', () => {
            expect(is.number(123)).toBeTruthy()
        })
        test('123.456 is number', () => {
            expect(is.number(123.456)).toBeTruthy()
        })
        test('"123.456" is not number', () => {
            expect(is.number("123.456")).toBeFalsy()
        })
    })

    describe('.instanceof()', () => {
        class A {}
        test('class {} is instance of Object', () => {
            expect(is.instanceof(A, Object)).toBeTruthy()
        })
    })
})
