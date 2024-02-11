/**
 *  gulp-tron - Build Manager
 */

import { Tron } from './core/tron.js'
export { BuildStream } from './core/buildSream.js'
export * from './utils/index.js'
export type * from './core/types.js'
export type * from './core/buildSream.js'
export type * from './core/tron.js'

const tron = new Tron()
export default tron
