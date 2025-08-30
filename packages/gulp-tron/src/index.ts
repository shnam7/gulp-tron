/**
 * Gulp-Tron
 */

import {Tron} from './tron.js'

const tron = new Tron()

export * from './types.js'
export * from './tron.js'
export * from './build-stream.js'
export * from './utils/index.js'

export {gulp} from './globals.js'
export {tron}
export default tron
