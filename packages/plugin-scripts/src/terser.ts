/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import terserG from 'gulp-terser'

export type TerserOptions = Parameters<typeof terserG>[0]

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const terserP = (options: TerserOptions): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(terserG(options))
}

export default terserP
