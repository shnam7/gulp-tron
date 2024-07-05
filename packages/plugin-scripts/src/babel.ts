/**
 *  gulp-tron plugin-scripts:babelP
 *
 */

import {type BuildStream, type PluginFunction} from 'gulp-tron'
import babelG from 'gulp-babel'

export type BabelOptions = Parameters<typeof babelG>[0]

// --- internals
type GulpBabelOptions = BabelOptions & {sourceMap?: any}

/**
 * Babel Plugin - wrapper for gulp-babel
 *
 * TaskConfig properties respected:
 *   - sourcemaps
 *
 * Notes:
 *   - Babel config uses sourceMaps (sourceMap is depecated).
 *     but gulp-babel still uses sourceMap, which causes warning.
 *     This plugin follows Babel config, automatically converting sourceMap
 *     to sourceMaps.
 *
 * @param options - Babel options (gulp-babel options with sourceMaps, instread of sourceMap)
 * @returns PluginFunction
 */
export const babelP =
    (options: BabelOptions = {}): PluginFunction =>
    (bs: BuildStream) => {
        // change sourceMaps to sourceMap to fit into gulp-babel interface w/ no warning
        const opts: GulpBabelOptions = {...options}
        if (!opts.sourceMaps && bs.opts.sourcemaps) opts.sourceMaps = bs.opts.sourcemaps
        if (opts.sourceMaps) {
            opts.sourceMap = opts.sourceMaps // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            delete opts.sourceMaps
        }

        bs.pipe(babelG(opts))
    }

export default babelP
