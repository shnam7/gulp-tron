/**
 *  Gulp-Tron plugin-scripts:eslint
 *
 */

import eslintG from "gulp-eslint-new";
import type { BuildStream, PluginFunction } from "gulp-tron";

export type EslintOptions = {
  formatter?: Parameters<typeof eslintG.format>[0];
} & eslintG.GulpESLintNewOptions;

/**
 * ESLint Plugin - wrapper for gulp-eslint-new
 *
 * @param options - ESLint options
 * @returns PluginFunction
 */
export const eslintP =
  (options: EslintOptions): PluginFunction =>
  (bs: BuildStream) => {
    const { formatter, ...eslintOptions } = options;
    bs.pipe(eslintG(eslintOptions)).pipe(eslintG.format(formatter)).pipe(eslintG.failAfterError());
  };

export default eslintP;
