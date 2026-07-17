/**
 *  gulp-tron plugin-styles:less
 *
 */

import lessG from "gulp-less";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type LessOptions = Parameters<typeof lessG>[0];

/**
 * Less Plugin - wrapper for gulp-less
 *
 * @param options - Less options
 * @returns PluginFunction
 */
export const lessP =
  (options?: LessOptions): PluginFunction =>
  (bs: BuildStream) => {
    bs.pipe(lessG(options));
  };

export default lessP;
