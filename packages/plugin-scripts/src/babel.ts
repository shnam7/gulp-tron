/**
 *  gulp-tron plugin-scripts:babelP
 *
 */

import babelG from "gulp-babel";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type BabelOptions = Parameters<typeof babelG>[0];

// --- internals
type GulpBabelOptions = BabelOptions & { sourceMap?: unknown }; // gulp-babel uses sourceMap (deprecated) instead of sourceMaps

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
    // gulp-babel uses sourceMap (deprecated) instead of sourceMaps — convert to suppress warnings
    const { sourceMaps, ...rest } = options;
    const resolvedSourceMaps = sourceMaps ?? (bs.opts.sourcemaps || undefined);
    const opts: GulpBabelOptions = resolvedSourceMaps
      ? { ...rest, sourceMap: resolvedSourceMaps }
      : rest;

    bs.pipe(babelG(opts));
  };

export default babelP;
