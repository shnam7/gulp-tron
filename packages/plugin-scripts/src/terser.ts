/**
 *  gulp-tron plugin-javascript
 *
 */

import terserG from "gulp-terser";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type TerserOptions = Parameters<typeof terserG>[0];

/**
 * Terser Plugin - wrapper for gulp-terser
 *
 * @param options - Terser options
 * @returns PluginFunction
 */
export const terserP =
  (options?: TerserOptions): PluginFunction =>
  (bs: BuildStream) => {
    bs.pipe(terserG(options));
  };

export default terserP;
