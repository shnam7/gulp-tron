/**
 *  gulp-tron plugin-javascript
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import terserG from 'gulp-terser'

export type TerserOptions = Parameters<typeof terserG>[0]

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const terserP =
    (options: TerserOptions): PluginFunction =>
    (bs: BuildStream) => {
        bs.pipe(terserG(options))
    }

export default terserP
