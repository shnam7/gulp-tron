import { describe, expect, it, test } from 'vitest'
import is from '../src/is.js'

describe('.Array()', () => {
    test('[] is array', () => {
        expect(is.Array([])).toBeTruthy()
    })
    test('{}} is not array', () => {
        expect(is.Array({})).toBeFalsy()
    })
})

describe('.Object()', () => {
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

describe('.Function()', () => {
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

describe('.String()', () => {
    test('"abc" is string', () => {
        expect(is.String("abc")).toBeTruthy()
    })
    test('String("abc") is string', () => {
        expect(is.String(new String("abc"))).toBeTruthy()
    })
})

describe('.Number()', () => {
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

describe('.Date()', () => {
    test('new Date() is Date type', () => {
        expect(is.Date(new Date())).toBeTruthy()
    })
})

describe('.RegExp()', () => {
    test('/123/ is number', () => {
        expect(is.RegExp(/123/)).toBeTruthy()
    })
})

describe('.Error()', () => {
    test('new Error("error") is Error', () => {
        expect(is.Error(new Error('error'))).toBeTruthy()
    })
})

describe('.Symbol()', () => {
    test('Symbol() is Symbol', () => {
        expect(is.Symbol(Symbol())).toBeTruthy()
    })
})

describe('.Map()', () => {
    test('new Map() is Map', () => {
        expect(is.Map(new Map())).toBeTruthy()
    })
})

describe('.WeakMap()', () => {
    test('new WeakMap() is WeakMap', () => {
        expect(is.WeakMap(new WeakMap())).toBeTruthy()
    })
    test('new WeakMap() is not Map', () => {
        expect(is.WeakMap(new Map())).toBeFalsy()
    })
})

describe('.Set()', () => {
    test('newSet() is Set', () => {
        expect(is.Set(new Set())).toBeTruthy()
    })
})

describe('.WeakSet()', () => {
    test('new WeakSet() is WeakSet', () => {
        expect(is.WeakSet(new WeakSet())).toBeTruthy()
    })
    test('new WeakSet() is not Set', () => {
        expect(is.WeakSet(new Set())).toBeFalsy()
    })
})

describe('.Class()', () => {
    class A {}
    test('class A {} is Class', () => {
        expect(is.Class(A)).toBeTruthy()
    })
    test('function is not Class', () => {
        expect(is.Class(() => {})).toBeFalsy()
    })
    test('Object is not Class', () => {
        expect(is.Class(Object)).toBeFalsy()
    })
    test('{} is not Class', () => {
        expect(is.Class({})).toBeFalsy()
    })
})
