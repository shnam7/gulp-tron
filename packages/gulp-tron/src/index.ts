/**
 * Gulp-Tron
 */
import {Tron} from './core/tron.js'

export {BuildStream} from './core/build-stream.js'
export {gulp} from './core/globals.js'
export * from './utils/index.js'
export type * from './core/types.js'
export type * from './core/build-stream.js'
export type * from './core/tron.js'

const tron = new Tron()

export default tron

export {series, parallel} from './core/tron.js'
