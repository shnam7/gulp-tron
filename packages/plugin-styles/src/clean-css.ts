/**
 *  gulp-tron plugin-styles:cleanCss
 *
 */

import type { OptionsOutput } from "clean-css";
import cleanCssG from "gulp-clean-css";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type CleanCssOptions = OptionsOutput;

/**
 * CleanCSS Plugin - wrapper for gulp-clean-css (minifies CSS by default)
 *
 * @param options - CleanCSS options
 * @returns PluginFunction
 */
export const cleanCssP =
  (options: CleanCssOptions = {}): PluginFunction =>
  (bs: BuildStream) => {
    bs.pipe(cleanCssG({ ...options }));
  };

export default cleanCssP;
