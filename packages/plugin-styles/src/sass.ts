/**
 *  Gulp-Tron plugin-styles:sass
 *
 */

import gulpSass from "gulp-sass";
import type { BuildStream, PluginFunction } from "gulp-tron";
import * as dartSass from "sass";

export type SassCompiler = Parameters<typeof gulpSass>[0];
export type SassOptions = Parameters<ReturnType<typeof gulpSass>>[0];

const sassG = gulpSass(dartSass as unknown as SassCompiler);

/**
 * Sass Plugin - wrapper for gulp-sass
 *
 * @param options - DartSass options
 * @returns PluginFunction
 */
export const sassP =
  (options?: SassOptions): PluginFunction =>
  (bs: BuildStream) => {
    const sassStream = sassG(options);
    const destroyable = sassStream as unknown as { destroy: (err: Error) => void };
    sassStream.on("error", (err: Error & { formatted?: string }) => {
      // Display nicely formatted sass error then propagate to fail the build
      console.error(err.formatted ?? err.message);
      destroyable.destroy(err);
    });
    bs.pipe(sassStream);
  };

export default sassP;
