/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import pcssG from 'gulp-postcss'

export type PostCssOptions = pcssG.Options
export type PostcssCallbackFunction = (file: any) => {plugins?: any[]; options?: PostCssOptions}

/**
 * Postcss Plugin - wrapper for gulp-postcss
 *
 * @param plugins plugins array.
 * @param callback callback function of type PostcssCallbackFunction.
 * @param options postcss Options.
 * @returns PluginFunction
 */
export function pcssP(plugins?: any[], options?: PostCssOptions): PluginFunction
export function pcssP(
    callback?: (file: any) => {plugins?: any[]; options?: PostCssOptions},
): PluginFunction

export function pcssP(
    pluginsOrCallback?: any[] | PostcssCallbackFunction,
    options?: PostCssOptions,
): PluginFunction {
    return (bs: BuildStream) => {
        if (typeof pluginsOrCallback === 'function') bs.pipe(pcssG(pluginsOrCallback))
        else bs.pipe(pcssG(pluginsOrCallback, options))
    }
}

export default pcssP
