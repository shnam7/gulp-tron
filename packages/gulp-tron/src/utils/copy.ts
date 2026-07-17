import fs from "node:fs";
import path from "node:path";
import { type Glob, isGlob } from "@wicle/is";
import globParent from "glob-parent";
import { globbySync } from "globby";
import type { LogOptions } from "../types.js";
import arrayify from "./arrayify.js";

export type CopyParam = {
  readonly src: string | string[];
  readonly dest: string;
};

export type CopyOptions = LogOptions & {
  readonly showStats?: boolean;
  readonly force?: boolean;
  readonly prefix?: string;
  readonly dryRun?: boolean;
  readonly cwd?: string; // Added to support precise scoping for negative globs
};

export type CopyResult = {
  copied: number;
  skipped: number;
  errors: number;
  message: string;
  srcPath: string;
  destPath: string;
};

export function isChanged(srcStat: fs.Stats, destStat: fs.Stats | undefined): boolean {
  return !destStat || srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size;
}

function copyStat(cr: CopyResult): string {
  const pluralizedFile = cr.copied === 1 ? "file" : "files";
  let message = `  >>>: ${cr.copied} ${pluralizedFile} copied`;

  if (cr.skipped > 0) message += `, ${cr.skipped} skipped (up-to-date)`;
  if (cr.errors > 0) message += `, ${cr.errors} failed`;

  return `${message}.`;
}

function logStats(retVal: CopyResult, opts: CopyOptions = {}): void {
  if (!opts.showStats || opts.logLevel === "silent") return;
  const logger = opts.logger ?? console.log;
  logger(copyStat(retVal));
}

/**
 * Process single file copy operation (Highly Optimized)
 */
export function copyFile(srcFile: string, dest: string, opts: CopyOptions = {}): CopyResult {
  const logger = opts.logger ?? console.log;
  const safeSrcFile = srcFile ?? "";
  const safeDest = dest ?? "";

  const fileName = path.basename(safeSrcFile);
  const destFile = path.resolve(safeDest, fileName);
  const absSrcFile = path.resolve(safeSrcFile);

  const retVal: CopyResult = {
    copied: 0,
    skipped: 0,
    errors: 0,
    message: "",
    srcPath: safeSrcFile,
    destPath: destFile,
  };

  if (!safeSrcFile || !safeDest) {
    retVal.errors = 1;
    retVal.message = "Source or destination path is empty.";
    return retVal;
  }

  if (absSrcFile === destFile) {
    retVal.errors = 1;
    retVal.message = `Source and destination are the same: ${safeSrcFile}`;
    return retVal;
  }

  try {
    const srcStat = fs.statSync(absSrcFile);
    let destStat: fs.Stats | undefined;

    if (!opts.force) {
      try {
        destStat = fs.statSync(destFile);
      } catch (error: unknown) {
        if (error instanceof Error) {
          const errnoError = error as NodeJS.ErrnoException;
          if (errnoError.code !== "ENOENT") {
            retVal.errors = 1;
            retVal.message = `Failed to stat destination: ${error.message}`;
            return retVal;
          }
        } else {
          retVal.errors = 1;
          retVal.message = String(error ?? "Unknown error during destination stat");
          return retVal;
        }
      }

      if (!isChanged(srcStat, destStat)) {
        if (opts.logLevel === "verbose") {
          logger(`${opts.prefix ?? ""}${safeSrcFile} --> ${safeDest} (already up-to-date)`);
        }
        retVal.skipped = 1;
        return retVal;
      }
    }

    if (opts.logLevel === "verbose") {
      logger(`${opts.prefix ?? ""}${safeSrcFile} --> ${safeDest}`);
    }

    if (opts.dryRun) {
      retVal.copied = 1;
      return retVal;
    }

    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(absSrcFile, destFile);

    retVal.copied = 1;
    return retVal;
  } catch (error: unknown) {
    retVal.errors = 1;
    if (error instanceof Error) {
      const errnoError = error as NodeJS.ErrnoException;
      if (errnoError.code === "ENOENT" && errnoError.path === absSrcFile) {
        retVal.message = `Source file does not exist: ${safeSrcFile}`;
      } else {
        retVal.message = `Failed to copy ${safeSrcFile}: ${error.message}`;
      }
    } else {
      retVal.message = String(error ?? "Unknown error during file copy execution");
    }
    return retVal;
  }
}

/**
 * Copy files from source globs to destination (Highly Optimized)
 */
export function copyGlob(globs: Glob, dest: string, opts: CopyOptions = {}): CopyResult {
  const normalizedGlobs = arrayify(globs);
  const safeDest = dest ?? "";

  if (!isGlob(normalizedGlobs) || normalizedGlobs.length === 0) {
    return {
      copied: 0,
      skipped: 0,
      errors: 0,
      message: "",
      srcPath: globs?.toString() ?? "",
      destPath: safeDest,
    };
  }
  if (!safeDest || safeDest.length === 0 || typeof safeDest !== "string") {
    throw new Error("dest parameter must be a non-empty string");
  }

  if (opts.logLevel !== "silent") {
    const logger = opts.logger ?? console.log;
    logger(`copy:['${normalizedGlobs.join(", ")}'] => '${safeDest}':`);
  }

  let firstPositiveGlob: string | undefined;
  for (let i = 0; i < normalizedGlobs.length; i++) {
    const pattern = normalizedGlobs[i];
    if (pattern && !pattern.startsWith("!")) {
      firstPositiveGlob = pattern;
      break;
    }
  }

  // Fixed: Fallback base resolving dynamically mapping to opts.cwd layout bounds safely
  const parentBase = firstPositiveGlob === undefined ? "." : globParent(firstPositiveGlob);
  const globBase = opts.cwd ? path.resolve(opts.cwd, parentBase) : parentBase;

  // Execute globbySync passing through continuous context configurations
  const filesToCopy = globbySync(normalizedGlobs, opts.cwd ? { cwd: opts.cwd } : undefined) ?? [];

  const retVal: CopyResult = {
    copied: 0,
    skipped: 0,
    errors: 0,
    message: "",
    srcPath: globs?.toString() ?? "",
    destPath: safeDest,
  };

  const errorMessages: string[] = [];
  const filesLength = filesToCopy.length;

  for (let i = 0; i < filesLength; i++) {
    const matchedPath = filesToCopy[i];
    if (!matchedPath) continue;

    // Resolve accurate full reference whether result is absolute or implicitly scoped
    const srcFile = opts.cwd ? path.resolve(opts.cwd, matchedPath) : matchedPath;
    const relSrc = path.relative(globBase, path.dirname(srcFile));
    const destPath = path.join(safeDest, relSrc);

    const result = copyFile(srcFile, destPath, { ...opts, prefix: `  ${i + 1}) ` });
    retVal.copied += result.copied;
    retVal.skipped += result.skipped;
    retVal.errors += result.errors;

    if (result.errors > 0) {
      errorMessages.push(result.message);
      if (opts.logLevel !== "silent") {
        const logger = opts.logger ?? console.log;
        logger(`  ${i + 1}) ERROR: ${result.message}`);
      }
    }
  }

  if (retVal.errors > 0) {
    retVal.message = errorMessages.join("\n");
  }

  logStats(retVal, opts);
  return retVal;
}

/**
 * Copy files from multiple sources to multiple destinations
 */
export function copyParam(params: CopyParam | CopyParam[], opts: CopyOptions = {}): CopyResult {
  const retVal: CopyResult = {
    copied: 0,
    skipped: 0,
    errors: 0,
    message: "",
    srcPath: "",
    destPath: "",
  };
  const subOpts = { ...opts, showStats: false };
  const normalizedParams = arrayify(params) ?? [];
  const paramsLength = normalizedParams.length;

  for (let i = 0; i < paramsLength; i++) {
    const param = normalizedParams[i];

    if (!param?.src || !param.dest) {
      retVal.errors += 1;
      const separator = retVal.message.length > 0 ? "\n" : "";
      retVal.message += `${separator}Invalid parameter object at index ${i}: 'src' and 'dest' are required.`;
      continue;
    }

    const ret = copyGlob(param.src, param.dest, subOpts);
    retVal.copied += ret.copied;
    retVal.skipped += ret.skipped;
    retVal.errors += ret.errors;
    if (ret.errors > 0) {
      const separator = retVal.message.length > 0 ? "\n" : "";
      retVal.message += `${separator}${ret.message}`;
    }
  }

  logStats(retVal, opts);
  return retVal;
}

export function copy(globs: Glob, destPath: string, opts?: CopyOptions): CopyResult;
export function copy(params: CopyParam | CopyParam[], opts?: CopyOptions): CopyResult;
export function copy(
  arg1: Glob | CopyParam | CopyParam[],
  arg2?: string | CopyOptions,
  arg3?: CopyOptions,
): CopyResult;

export function copy(
  arg1: Glob | CopyParam | CopyParam[],
  arg2?: string | CopyOptions,
  arg3?: CopyOptions,
): CopyResult {
  if (typeof arg2 === "string") {
    return copyGlob(arg1 as Glob, arg2, arg3 ?? {});
  }

  const options = (typeof arg2 === "object" ? arg2 : arg3) ?? {};
  return copyParam(arg1 as CopyParam | CopyParam[], options);
}

export default copy;
