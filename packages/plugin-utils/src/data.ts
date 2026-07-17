import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import dataG, { type DataFunction, type DataObject } from "gulp-data";
import { arrayify, type BuildStream, is, type LogOptions, type PluginFunction } from "gulp-tron";
import * as yaml from "js-yaml";

export type Globs = string | string[];
// export type DataObject<T extends Record<string, unknown> = Record<string, unknown>> = T & LogOptions
// export type DataFunction = (file: any, callback: TransformCallback) => any
// export type DataOptions = DataFunction | DataObject | Globs // function returing data or data itself(any type)

export function loadData(patterns: Globs, options?: LogOptions): DataObject {
  let data: DataObject = {};
  const logger = options?.logger ?? console.log;
  for (const pattern of arrayify(patterns)) {
    for (const file of fg.globSync(pattern)) {
      const ext = path.extname(file).toLowerCase();

      if (ext === ".yml" || ext === ".yaml") {
        let yamlData = yaml.load(fs.readFileSync(file, "utf8"));
        yamlData = { [path.parse(file).name]: yamlData };
        data = { ...data, ...(yamlData as DataObject) };
      } else if (ext === ".json")
        data = {
          ...data,
          [path.parse(file).name]: {
            ...(JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>),
          },
        };
      else {
        const logger = options?.logger ?? console.warn;
        logger(`loadData: skipping unsupported file type: ${file}`);
      }
    }
  }

  const patternStr = is.isArray(patterns) ? (patterns as string[]).join(",") : patterns;
  if (options?.logLevel === "verbose") logger(`loadData:${patternStr.toString()}:`, data);
  return data;
}

/**
 * Data plugin - wrapper for gulp-data (attach data to file.data)
 * @param data function returning data or any data
 * @returns PluginFunction
 */
export function dataP(globOrFunc: Globs | DataFunction): PluginFunction;
// export function dataP(obj: DataObject): PluginFunction
export function dataP(data: Globs | DataFunction): PluginFunction {
  return (bs: BuildStream) => {
    if (is.isString(data) || is.isArray(data)) {
      const logOptions = { logLevel: bs.opts.logLevel, logger: bs.logger };
      return bs.pipe(dataG(loadData(data as Globs, logOptions)));
    }

    return bs.pipe(dataG(data as DataFunction));
  };
}

export default dataP;
