/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import eslintG from 'gulp-eslint-new'

export type EslintOptions = {
    formatter?: Parameters<typeof eslintG.format>[0]
} & eslintG.GulpESLintOptions

/**
 * ESLint Plugin - wrapper for gulp-terser
 *
 * @param options - ESLint options
 * @returns PluginFunction
 */
export const eslintP = (options: EslintOptions): PluginFunction => (bs: BuildStream) => {

    bs.pipe(eslintG(options))

    if (options.fix) bs.pipe(eslintG.fix())

    return bs
        .pipe(eslintG.format())
        .pipe(eslintG.failAfterError())
}

export default eslintP
