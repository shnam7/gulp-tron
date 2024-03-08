/**
 * Gulp-Tron
 */
import { Tron, series, parallel } from './core/tron.js'
export { BuildStream } from './core/buildSream.js'
export * from './utils/index.js'
export type * from './core/types.js'
export type * from './core/buildSream.js'
export type * from './core/tron.js'

const tron = new Tron()

export { series, parallel }
export default tron
