/**
 *  gulp-tron plugin-styles:autoprefixer
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import autoPrefixerG from 'gulp-autoprefixer'

export type AutoPrefixerOptions = Parameters<typeof autoPrefixerG>[0]

/**
 * AutoPrefixer Plugin - wrapper for gulp-autoprefixer
 *
 * @param options - autoprefixer options
 * @returns PluginFunction
 */
export const autoPrefixerP =
    (options?: AutoPrefixerOptions): PluginFunction =>
    (bs: BuildStream) => {
        bs.pipe(autoPrefixerG(options))
    }

export default autoPrefixerP
