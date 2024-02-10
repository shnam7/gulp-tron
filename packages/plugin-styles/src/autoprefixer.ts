/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import autoPrefixerG from 'gulp-autoprefixer'

export type AutoPrefixerOptions = autoPrefixerG.Options

/**
 * autoPrefixer Plugin - wrapper for gulp-autoprefixer
 *
 * @param options -autoprefixer options
 * @returns PluginFunction
 */
export const autoPrefixerP = (options?: AutoPrefixerOptions): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(autoPrefixerG(options))
}

export default autoPrefixerP
