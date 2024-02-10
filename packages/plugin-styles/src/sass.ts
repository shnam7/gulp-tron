/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sassG = gulpSass(dartSass)

export type SassOptions = Parameters<ReturnType<typeof gulpSass>>[0]

/**
 * Sass Plugin - wrapper for gulp-sass
 *
 * @param options - DartSass options
 * @returns PluginFunction
 */
export const sassP = (options?: SassOptions): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(sassG(options)).on('error', sassG.logError)
}

export default sassP
