/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'

import pcssG from 'gulp-postcss'
import pcssReporter from 'postcss-reporter'
import stylelint, { PostcssPluginOptions, Config, LinterOptions } from 'stylelint'

export type StylelintOptions = PostcssPluginOptions
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
        return bs.pipe(pcssG([stylelint(options), pcssReporter(reporterOptions)]))
    }

export default stylelintP

