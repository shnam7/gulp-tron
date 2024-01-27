/**
 * Make the argument to be array type if it is not already in srray type.
 *
 * @param arg argument to arrayfy
 * @returns arrayfied arg. Ex: returns [arg], if arg is not already array.
 */
const arrayify = <T>(arg?: T | T[]): T[] => arg ? (Array.isArray(arg) ? arg : [arg]) : []

export default arrayify
