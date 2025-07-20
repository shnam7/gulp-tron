export type Glob = string | readonly string[]

export const isGlob = (value: unknown): value is Glob =>
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(item => typeof item === 'string'))

export default isGlob
