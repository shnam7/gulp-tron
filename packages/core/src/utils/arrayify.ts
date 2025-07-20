/**
 * Make the argument to be array type if it is not already in srray type.
 *
 * @param arg argument to arrayfy
 * @returns arrayfied arg. Ex: returns [arg], if arg is not already array.
 */
export const arrayify = <T>(arg?: T | readonly T[]): T[] =>
    arg === undefined ? [] : Array.isArray(arg) ? arg : [arg as T]

export default arrayify
