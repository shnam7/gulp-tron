/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import pcssG from 'gulp-postcss'

export type PostCssOptions = pcssG.Options
type PcssParam1 = Parameters<typeof pcssG>[0]

/**
 * Postcss Plugin - wrapper for gulp-postcss
 *
 * @param options -PostCSS options
 * @returns BuildStream in prog
 */
export const pcssP = (plugins?: any[] | PcssParam1, options?: PostCssOptions) => (bs: BuildStream) => {

    if (typeof plugins === 'function')
        bs.pipe(pcssG(plugins))
    else
        bs.pipe(pcssG(plugins, options))
    return this
}

export default pcssP
