
const _is = (a: any, name: string): boolean => toString.call(a) === '[object ' + name + ']'

const is = {
    // Array: (a: unknown): a is (typeof a)[] => Array.isArray(a),
    Array: (a: unknown): a is (typeof a)[] => _is(a, 'Array'),
    // Object: (a: unknown): a is object => a === Object(a),
    Object: (a: unknown): a is object => _is(a, 'Object'),
    Arguments: (a: unknown) => _is(a, 'Argument'),
    // Function: (a: unknown): a is Function => _is(a, 'Function')
    Function: (a: unknown): a is Function => typeof a === 'function' && !/^class\s/.test(Function.prototype.toString.call(a)),
    String: (a: unknown): a is string => _is(a, 'String'),
    Number: (a: unknown): a is number => _is(a, 'Number'),
    Date: (a: unknown): a is Date => _is(a, 'Date'),
    RegExp: (a: unknown): a is RegExp => _is(a, 'RegExp'),
    Error: (a: unknown): a is Error => _is(a, 'Error'),
    Symbol: (a: unknown): a is Symbol => _is(a, 'Symbol'),
    Map: (a: unknown): a is typeof Map => _is(a, 'Map'),
    WeakMap: (a: unknown): a is typeof WeakMap => _is(a, 'WeakMap'),
    Set: (a: unknown): a is typeof Set => _is(a, 'Set'),
    WeakSet: (a: unknown): a is typeof WeakSet => _is(a, 'WeakSet'),
    Class: (a: unknown): a is typeof Function => typeof a === 'function' && /^class\s/.test(Function.prototype.toString.call(a))
}

export default is
