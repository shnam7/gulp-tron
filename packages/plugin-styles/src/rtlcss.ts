/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import rtlcssG, { ConfigureOptions } from 'gulp-rtlcss'

export type RtlCssConfigureOptions = ConfigureOptions

/**
 * Less Plugin - wrapper for gulp-less
 *
 * @param options - less options
 * @returns PluginFunction
 */
export const rtlcssP = (options: RtlCssConfigureOptions = {}): PluginFunction => (bs: BuildStream) => {
    const opts = { ...options }
    return bs.pipe(rtlcssG(options))
}

export default rtlcssP
