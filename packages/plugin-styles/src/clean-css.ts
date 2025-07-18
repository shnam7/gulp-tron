/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import {type BuildStream, type PluginFunction} from '@gulp-tron/core'
import cleanCssG from 'gulp-clean-css'
import {type OptionsOutput} from 'clean-css'

export type CleanCssOptions = OptionsOutput

/**
 * CleanCss Plugin - wrapper for culp-clean-css
 *
 * @param options - CleanCss options
 * @returns PluginFunction
 */
export const cleanCssP =
    (options: CleanCssOptions = {}): PluginFunction =>
    (bs: BuildStream) => {
        const opts = {...options}
        opts.format ??= 'beautify'
        bs.pipe(cleanCssG(opts))

        // if (!opts.level) opts.level = { 2: { mergeSemantically: true } }

        // bs.on('data', function (file: Vinyl) {
        //     const bufferFile = new CleanCSS(options).minify(file.contents)
        //     return (file.contents = Buffer.from(bufferFile.styles))
        //     return file.contents
        // })
    }

export default cleanCssP
