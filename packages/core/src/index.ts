/**
 * Gulp-Tron
 */

import {Tron} from './tron.js'

const tron = new Tron()

export type * from './types.js'
export type * from './build-stream.js'
export type * from './tron.js'
export {default as is} from '@wicle/is'
export {default as arrayify} from './utils/arrayify.js'
export {gulp} from './globals.js'
export {BuildStream} from './build-stream.js'
export {series, parallel} from './tron.js'
export {tron}
export default tron
