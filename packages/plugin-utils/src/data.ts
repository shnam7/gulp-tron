import fs from "node:fs/promises";
import path from "node:path";
import type { TransformCallback } from "node:stream";
import { arrayify, type BuildStream, is, type LogOptions, type PluginFunction } from "gulp-tron";
import * as yaml from "js-yaml";
import { glob } from "tinyglobby";
import type File from "vinyl";

export type DataObject = Record<string, unknown>;

export type DataFunctionCallback = (
  err: Error | null | undefined,
  data?: Record<string, unknown>,
) => void;
export type DataFunction = (
  file: File,
  callback: DataFunctionCallback,
) => Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>;

export type Globs = string | string[];

/**
 * Scans and parses YAML/JSON files asynchronously, returning a merged data object.
 */
export async function loadDataAsync(
  patterns: Globs,
  options: LogOptions = {},
): Promise<DataObject> {
  let data: DataObject = {};
  const logger = options.logger ?? console;

  const matchedFiles = await glob(arrayify(patterns));

  for (const file of matchedFiles) {
    const ext = path.extname(file).toLowerCase();

    try {
      if (ext === ".yml" || ext === ".yaml") {
        const content = await fs.readFile(file, "utf8");
        let yamlData = yaml.load(content);
        yamlData = { [path.parse(file).name]: yamlData };
        data = { ...data, ...(yamlData as DataObject) };
      } else if (ext === ".json") {
        const content = await fs.readFile(file, "utf8");
        data = {
          ...data,
          [path.parse(file).name]: {
            ...JSON.parse(content),
          },
        };
      } else {
        logger.warn(`loadData: skipping unsupported file type: ${file}`);
      }
    } catch (fileErr) {
      logger.error(`loadData: failed to read file [${file}]:`, fileErr);
    }
  }

  const patternStr = is.isArray(patterns) ? (patterns as string[]).join(",") : patterns;
  if (options?.logLevel === "verbose") logger.info(`loadData:${patternStr.toString()}:`, data);
  return data;
}

/**
 * Data plugin - Attaches data to file.data using BuildStream.intercept()
 * @param data Glob patterns or a custom function returning data
 * @returns PluginFunction
 */
export function dataP(globOrFunc: Globs | DataFunction): PluginFunction;
export function dataP(data: Globs | DataFunction): PluginFunction {
  return (bs: BuildStream) => {
    let loadingPromise: Promise<DataObject> | null = null;

    if (is.isString(data) || is.isArray(data)) {
      const logOptions = { logLevel: bs.opts.logLevel, logger: bs.logger };
      loadingPromise = loadDataAsync(data, logOptions);
    }

    return bs.intercept(async (file: File, _enc: string, cb: TransformCallback) => {
      file.data = file.data || {};

      try {
        // 1. Static Glob Pattern Branch (Cached execution)
        if (loadingPromise) {
          const loadedData = await loadingPromise;
          file.data = { ...file.data, ...loadedData };
          return cb(null, file);
        }

        // 2. Dynamic DataFunction Branch
        if (typeof data === "function") {
          const result = await data(file, (err, resData) => {
            if (err) return cb(err);
            if (resData) file.data = { ...file.data, ...resData };
            cb(null, file);
          });

          if (result) file.data = { ...file.data, ...result };
          return cb(null, file);
        }
      } catch (err) {
        return cb(err instanceof Error ? err : new Error(String(err)));
      }
    });
  };
}

export default dataP;
