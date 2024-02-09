/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import rtlcssG, { ConfigureOptions } from 'gulp-rtlcss'

export type RtlCssConfigureOptions = ConfigureOptions

/**
 * Less Plugin - wrapper for gulp-less
 *
 * @param options - less options
 * @returns BuildStream in progress
 */
export const rtlcssP = (options: RtlCssConfigureOptions = {}) => (bs: BuildStream) => {
    const opts = { ...options }
    return bs.pipe(rtlcssG(options))
}

export default rtlcssP
