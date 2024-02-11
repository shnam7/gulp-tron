/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import pcssG from 'gulp-postcss'
import type Vinyl from 'vinyl'

export type PostCssOptions = pcssG.Options
export type PostcssCallbackFunction = (file: Vinyl) => { plugins?: any[]; options?: PostCssOptions }

/**
 * Postcss Plugin - wrapper for gulp-postcss
 *
 * @param pluginsOrCallback plugins array or callback function of type PostcssCallbackFunction
 * @param options postcss Options
 * @returns PluginFunction
 */
export function pcssP(callback?: (file: Vinyl) => { plugins?: any[]; options?: PostCssOptions }): PluginFunction
export function pcssP(plugins?: any[], options?: PostCssOptions): PluginFunction
export function pcssP(pluginsOrCallback?: any[] | PostcssCallbackFunction, options?: PostCssOptions): PluginFunction {
    return (bs: BuildStream) => {
        if (typeof pluginsOrCallback === 'function') return bs.pipe(pcssG(pluginsOrCallback))
        return bs.pipe(pcssG(pluginsOrCallback, options))
    }
}

export default pcssP
