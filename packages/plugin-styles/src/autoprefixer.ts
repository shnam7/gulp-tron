/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import autoPrefixerG from 'gulp-autoprefixer'

export type AutoPrefixerOptions = autoPrefixerG.Options

/**
 * autoPrefixer Plugin - wrapper for gulp-autoprefixer
 *
 * @param options -autoprefixer options
 * @returns BuildStream in progress
 */
export const autoPrefixerP = (options?: AutoPrefixerOptions) => (bs: BuildStream) => {
    return bs.pipe(autoPrefixerG(options))
}

export default autoPrefixerP
