/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sassG = gulpSass(dartSass)

export type SassOptions = Parameters<ReturnType<typeof gulpSass>>[0]

/**
 * Sass Plugin - wrapper for gulp-sass
 *
 * @param options - DartSass options
 * @returns BuildStream in progress
 */
export const sassP = (options?: SassOptions) => (bs: BuildStream) => {
    return bs.pipe(sassG(options)).on('error', sassG.logError)
}

export default sassP
