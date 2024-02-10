
/**
 *  gulp-tron plugin-scripts:babelP
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import babelG from 'gulp-babel'

export type BabelOptions = Parameters<typeof babelG>[0]

type GulpBabelOptions = BabelOptions & { sourceMap?: any }

/**
 * Babel Plugin - wrapper for gulp-babel
 *
 * @param options - Babel options
 * @returns PluginFunction
 */
export const babelP = (options: BabelOptions = {}): PluginFunction => (bs: BuildStream) => {

    // change sourceMaps to sourceMap to fit into gulp-babel interface w/ no warning
    const opts: GulpBabelOptions = { ...options }
    if (!opts.sourceMaps && bs.opts.sourcemaps) opts.sourceMaps = bs.opts.sourcemaps
    if (opts.sourceMaps) {
        opts.sourceMap = opts.sourceMaps
        delete opts.sourceMaps
    }
    return bs.pipe(babelG(opts))
}

export default babelP
