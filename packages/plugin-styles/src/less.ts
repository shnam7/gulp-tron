/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import { BuildStream } from 'gulp-tron'
import lessG from 'gulp-less'

export type LessOptions = Parameters<typeof lessG>[0]

/**
 * Less Plugin - wrapper for gulp-less
 *
 * @param options - less options
 * @returns BuildStream in progress
 */
export const lessP = (options?: LessOptions) => (bs: BuildStream) => {
    return bs.pipe(lessG(options))
}

export default lessP
