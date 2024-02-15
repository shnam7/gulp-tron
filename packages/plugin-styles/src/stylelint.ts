/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction, is } from 'gulp-tron'

import pcssG from 'gulp-postcss'
import pcssReporter from 'postcss-reporter'
import stylelint, { PostcssPluginOptions } from 'stylelint'
import sassParser from 'postcss-sass'
import scssParser from 'postcss-scss'
import lessParser from 'postcss-less'

export type StylelintOptions = PostcssPluginOptions & pcssG.Options
export type StylelintReporterOptions = pcssReporter.Options

/**
 * Stylelint Plugin - use postcss for linting.
 *
 * @param options - Stylelint options
 * @returns PluginFunction
 */
export const stylelintP = (options?: StylelintOptions, reporterOptions: StylelintReporterOptions = {})
    : PluginFunction => (bs: BuildStream) => {
        if (!options) options = { rules: {} }   // depress 'No configuration provided' error

        let pcssOptions: pcssG.Options = { parser: options.parser }
        if (!is.Object(options.parser)) switch (options.parser) {
            case 'scss':
                pcssOptions = { parser: scssParser }
                break
            case 'sass':
                pcssOptions = { parser: sassParser }
                break
            case 'less':
                pcssOptions = { parser: lessParser }
                break
        }
        // console.log(`---111`, pcssOptions, is.Object(options.parser))
        bs.pipe(pcssG([stylelint(options), pcssReporter(reporterOptions)], pcssOptions))
            .on('error', (e) => {
                bs.log(e.toString())
                // .stream.emit('end')  // signal that task finished
            })
        return bs
    }

/**
* Stylelint Sass Plugin - styleint with postcss-sass as default parser.
*
* @param options - Stylelint options
* @returns PluginFunction
*/
export const stylelintSasssP = (options: StylelintOptions = {}, reporterOptions: StylelintReporterOptions = {}) => {
    const opts: StylelintOptions = { ...options, parser: sassParser }
    return stylelintP(opts, reporterOptions)
}

/**
* Stylelint Scss Plugin - styleint with postcss-scss as default parser.
*
* @param options - Stylelint options
* @returns PluginFunction
*/
export const stylelintScssP = (options: StylelintOptions = {}, reporterOptions: StylelintReporterOptions = {}) => {
    const opts: StylelintOptions = { ...options, parser: scssParser }
    return stylelintP(opts, reporterOptions)
}

/**
* Stylelint Less Plugin - styleint with postcss-less as default parser.
*
* @param options - Stylelint options
* @returns PluginFunction
*/
export const stylelintLessP = (options: StylelintOptions = {}, reporterOptions: StylelintReporterOptions = {}) => {
    const opts: StylelintOptions = { ...options, parser: lessParser }
    return stylelintP(opts, reporterOptions)
}

export default stylelintP
