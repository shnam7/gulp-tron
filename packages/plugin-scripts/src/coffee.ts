/**
 *  gulp-tron plugin-scripts:coffee
 *
 */

import coffeeG, { type CoffeeOptions } from "gulp-coffee";
import type { BuildStream, PluginFunction } from "gulp-tron";

/**
 * CoffeeScript Plugin - wrapper for gulp-coffee
 *
 * @param options - CoffeeScript options
 * @returns PluginFunction
 */
export const coffeeP =
  (options: CoffeeOptions = {}): PluginFunction =>
  (bs: BuildStream): void => {
    bs.pipe(coffeeG(options));
  };

export default coffeeP;
export type { CoffeeOptions } from "gulp-coffee";
