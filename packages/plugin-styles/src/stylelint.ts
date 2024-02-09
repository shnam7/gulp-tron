/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
// import stylelintG, { GulpStylelintOptions } from '@ronilaukkarinen/gulp-stylelint'
// import stylelintG, { Options } from '@ronilaukkarinen/gulp-stylelint'

// // export type StylelintOptions = GulpStylelintOptions
// export type StylelintOptions = Options

// /**
//  * Stylelint Plugin - wrapper for gulp-stylelint
//  *
//  * @param options - Stylelint options
//  * @returns BuildStream in prog
//  */
// export const stylelintP = (options: StylelintOptions) => (bs: BuildStream) => {
//     console.log(`---1:`, options)
//     return bs.filter().pipe(stylelintG(options))
// }


import pcssG from 'gulp-postcss'
import pcssReporter from 'postcss-reporter'
import stylelint, { PostcssPluginOptions } from 'stylelint'

export type StylelintOptions = PostcssPluginOptions
export type StylelintReporterOptions = pcssReporter.Options

/**
 * Stylelint Plugin - wrapper for gulp-stylelint
 *
 * @param options - Stylelint options
 * @returns BuildStream in prog
 */
export const stylelintP = (options?: StylelintOptions, reporterOptions: StylelintReporterOptions = {}) => (bs: BuildStream) => {
    return bs.pipe(pcssG([stylelint(options), pcssReporter(reporterOptions)])) // use postcss for linting
}

export default stylelintP

