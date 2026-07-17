/**
 *  gulp-tron plugin-scripts:concat
 *
 */

import concatG from "gulp-concat";
import type { BuildStream, PluginFunction } from "gulp-tron";

// type info from gulp-concat
export interface IOptions {
  newLine: string;
}

export type ConcatOptions = Parameters<typeof concatG>[0];

/**
 * Concat Plugin - wrapper for gulp-concat
 *
 * @param options - output filename or gulp-concat options object (must include a filename/path)
 * @returns PluginFunction
 */
export function concatP(filename: string, options?: IOptions): PluginFunction;
export function concatP(options: ConcatOptions): PluginFunction;

export function concatP(
  filenameOrOptions: string | ConcatOptions,
  options?: IOptions,
): PluginFunction {
  return (bs: BuildStream) => {
    if (typeof filenameOrOptions === "string") {
      if (!filenameOrOptions.trim()) throw new Error("concatP: output filename is required");
      bs.pipe(concatG(filenameOrOptions, options ?? undefined));
    } else {
      if (!filenameOrOptions.path?.trim()) throw new Error("concatP: path is required in options");
      bs.pipe(concatG(filenameOrOptions));
    }
  };
}
export default concatP;
