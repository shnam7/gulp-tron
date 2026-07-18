/**
 *  Gulp-Tron plugin-styles:pcss
 *
 */

import pcssG from "gulp-postcss";
import type { BuildStream, PluginFunction } from "gulp-tron";
import type { AcceptedPlugin } from "postcss";

export type PostCssOptions = pcssG.Options;
export type PostcssCallbackFunction = (file: unknown) => {
  plugins?: AcceptedPlugin[];
  options?: PostCssOptions;
};

/**
 * PostCSS Plugin - wrapper for gulp-postcss
 *
 * @param plugins PostCSS plugins array
 * @param options PostCSS options
 * @returns PluginFunction
 */
export function pcssP(plugins?: AcceptedPlugin[], options?: PostCssOptions): PluginFunction;
export function pcssP(callback?: PostcssCallbackFunction): PluginFunction;

export function pcssP(
  pluginsOrCallback?: AcceptedPlugin[] | PostcssCallbackFunction,
  options?: PostCssOptions,
): PluginFunction {
  return (bs: BuildStream) => {
    if (typeof pluginsOrCallback === "function")
      bs.pipe(pcssG(pluginsOrCallback as Parameters<typeof pcssG>[0]));
    else bs.pipe(pcssG(pluginsOrCallback, options));
  };
}

export default pcssP;
