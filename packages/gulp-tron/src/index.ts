/**
 *  gulp-tron - Build Manager
 */

import { Tron } from './core/tron.js'
export { BuildStream } from './core/buildSream.js'
export type { PluginFunction, PluginOptions } from './core/types.js'

const tron = new Tron()
export default tron
