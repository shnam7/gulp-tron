/**
 *  gulp-tron plugin-styles:autoprefixer
 *
 */

import autoPrefixerG from "gulp-autoprefixer";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type AutoPrefixerOptions = Parameters<typeof autoPrefixerG>[0];

/**
 * AutoPrefixer Plugin - wrapper for gulp-autoprefixer
 *
 * @param options - autoprefixer options
 * @returns PluginFunction
 */
export const autoPrefixerP =
  (options?: AutoPrefixerOptions): PluginFunction =>
  (bs: BuildStream) => {
    bs.pipe(autoPrefixerG(options));
  };

export default autoPrefixerP;
