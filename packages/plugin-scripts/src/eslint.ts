/**
 *  gulp-tron plugin-scripts:eslint
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import eslintG from 'gulp-eslint-new'

export type EslintOptions = {
    formatter?: Parameters<typeof eslintG.format>[0]
} & eslintG.GulpESLintNewOptions

/**
 * ESLint Plugin - wrapper for gulp-eslint-new
 *
 * @param options - ESLint options
 * @returns PluginFunction
 */
export const eslintP =
    (options: EslintOptions): PluginFunction =>
    (bs: BuildStream) => {
        const {formatter, ...eslintOptions} = options
        bs.pipe(eslintG(eslintOptions))
            .pipe(eslintG.format(formatter))
            .pipe(eslintG.failAfterError())
    }

export default eslintP
