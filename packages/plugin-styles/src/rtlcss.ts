/**
 *  gulp-tron plugin-styles
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import rtlcssG, {type RtlCssOptions} from 'gulp-rtlcss'

/**
 * Less Plugin - wrapper for gulp-less
 *
 * @param options - less options
 * @returns PluginFunction
 */
export const rtlcssP =
    (options: RtlCssOptions = {}): PluginFunction =>
    (bs: BuildStream): void => {
        bs.pipe(rtlcssG(options))
    }

export default rtlcssP
export {type RtlCssOptions} from 'gulp-rtlcss'
