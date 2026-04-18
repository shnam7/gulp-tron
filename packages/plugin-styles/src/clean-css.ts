/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import cleanCssG from 'gulp-clean-css'
import {type OptionsOutput} from 'clean-css'

export type CleanCssOptions = OptionsOutput

/**
 * CleanCSS Plugin - wrapper for gulp-clean-css (minifies CSS by default)
 *
 * @param options - CleanCSS options
 * @returns PluginFunction
 */
export const cleanCssP =
    (options: CleanCssOptions = {}): PluginFunction =>
    (bs: BuildStream) => {
        bs.pipe(cleanCssG({...options}))
    }

export default cleanCssP
