/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import concatG from 'gulp-concat'

export type ConcatOptions = Parameters<typeof concatG>[0]

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const concatP = (options: ConcatOptions): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(concatG(options))
}

export default concatP
