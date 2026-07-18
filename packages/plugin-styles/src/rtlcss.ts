/**
 *  Gulp-Tron plugin-styles
 *
 */

import rtlcssG, { type RtlCssOptions } from "gulp-rtlcss";
import type { BuildStream, PluginFunction } from "gulp-tron";

/**
 * RTLCSS Plugin - wrapper for gulp-rtlcss (converts LTR CSS to RTL)
 *
 * @param options - RTLCSS options
 * @returns PluginFunction
 */
export const rtlcssP =
  (options: RtlCssOptions = {}): PluginFunction =>
  (bs: BuildStream): void => {
    bs.pipe(rtlcssG(options));
  };

export default rtlcssP;
export type { RtlCssOptions } from "gulp-rtlcss";
