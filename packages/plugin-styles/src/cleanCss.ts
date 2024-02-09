/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import CleanCSS from 'clean-css'

export type CleanCssOptions = CleanCSS.OptionsOutput

/**
 * CleanCss Plugin - wrapper for culp-clean-css
 *
 * @param options - CleanCss options
 * @returns BuildStream in progress
 */
export const cleanCssP = (options: CleanCssOptions = {}) => (bs: BuildStream) => {

    const opts = { ...options }
    if (!opts.format) opts.format = 'beautify'
    // if (!opts.level) opts.level = { 2: { mergeSemantically: true } }

    return bs.on('data', function(file) {
        const bufferFile = new CleanCSS(options).minify(file.contents)
        return file.contents = Buffer.from(bufferFile.styles)
    })
}

export default cleanCssP
