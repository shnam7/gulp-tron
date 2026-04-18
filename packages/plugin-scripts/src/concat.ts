/**
 *  gulp-tron plugin-scripts:concat
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import concatG from 'gulp-concat'

export type ConcatOptions = Parameters<typeof concatG>[0]

/**
 * Concat Plugin - wrapper for gulp-concat
 *
 * @param options - output filename or gulp-concat options object (must include a filename/path)
 * @returns PluginFunction
 */
export const concatP =
    (options: ConcatOptions): PluginFunction =>
    (bs: BuildStream) => {
        const filename = typeof options === 'string' ? options : (options as {path?: string})?.path
        if (!filename) throw new Error('concatP: output filename is required')
        bs.pipe(concatG(options))
    }

export default concatP
