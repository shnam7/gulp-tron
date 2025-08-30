import fs from 'node:fs'
import path from 'node:path'
import {globbySync} from 'globby'
import globParent from 'glob-parent'
import type {LogOptions} from '../types.js'
import arrayify from './arrayify.js'
// import {type Glob, isGlob} from './isglob.js'
import {type Glob, isGlob} from './isglob.js'

/** Type for copy parameter with source and destination */
export type CopyParam = {
    readonly src: string | string[]
    readonly dest: string
}

/** Type for copy options extending LogOptions */
export type CopyOptions = {
    readonly showStats?: boolean // Whether to show copy result statistics
    readonly force?: boolean // Whether to force copy even if file is up-to-date
    readonly prefix?: string // Optional prefix for logging
    readonly dryRun?: boolean
} & LogOptions

/** Type for copy operation result */
export type CopyResult = {
    readonly copied: number
    readonly skipped: number
    readonly errors: number
    readonly message: string
    readonly srcPath: string
    readonly destPath: string
}

const defaultCopyResult: CopyResult = {
    copied: 0,
    skipped: 0,
    errors: 0,
    message: '',
    srcPath: '',
    destPath: '',
}

/**
 * Check if file needs to be copied based on modification time and size
 * @param srcStat Source file stats
 * @param destStat Destination file stats (undefined if doesn't exist)
 * @returns true if file should be copied
 */
export function isChanged(srcStat: fs.Stats, destStat: fs.Stats | undefined): boolean {
    return !destStat || srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size
}

/**
 * Generate result message for copy operations
 * @param copied Number of files copied
 * @param skipped Number of files skipped
 * @param errors Number of errors encountered
 * @returns Formatted result message
 */
function copyStat(cr: CopyResult): string {
    const pluralizedFile = cr.copied === 1 ? 'file' : 'files'
    let message = `  >>>: ${cr.copied} ${pluralizedFile} copied`

    if (cr.skipped > 0) message += `, ${cr.skipped} skipped (up-to-date)`
    if (cr.errors > 0) message += `, ${cr.errors} failed`

    return message + '.'
}

function logStats(retVal: CopyResult, opts: CopyOptions = {}): void {
    if (!opts.showStats || opts.logLevel === 'silent') return

    const logger = opts.logger ?? console.log
    logger(copyStat(retVal))
}

/**
 * Process single file copy operation
 * @param srcFile Source file path
 * @param dest Destination directory
 * @param index File index for logging
 * @param opts Copy options
 * @returns File operation result
 */
export function copyFile(srcFile: string, dest: string, opts: CopyOptions = {}): CopyResult {
    const logger = opts.logger ?? console.log
    const fileName = path.basename(srcFile)
    const destFile = path.resolve(dest, fileName)
    const retVal = {...defaultCopyResult, srcPath: srcFile, destPath: destFile}

    try {
        const srcStat = fs.statSync(srcFile)
        let destStat: fs.Stats | undefined

        try {
            destStat = fs.statSync(destFile)
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                const errorMessage = `Failed to stat destination: ${error.message}`
                return {...retVal, errors: 1, message: errorMessage}
            }
        }

        const copyInfo = `${opts.prefix}${srcFile} --> ${dest}`

        if (!isChanged(srcStat, destStat) && !opts.force) {
            if (opts.logLevel === 'verbose') logger(`${copyInfo} (already up-to-date)`)
            return {...retVal, skipped: 1}
        }

        if (opts.logLevel === 'verbose') logger(copyInfo)
        if (opts.dryRun) return {...retVal, copied: 1}

        fs.mkdirSync(path.dirname(destFile), {recursive: true})
        fs.copyFileSync(srcFile, destFile)

        logStats(retVal, opts)

        return {...retVal, copied: 1}
    } catch (error: any) {
        // Handle source file not found or other errors
        if (error.code === 'ENOENT' && error.path === srcFile) {
            const errorMessage = `Source file does not exist: ${srcFile}`
            return {...retVal, errors: 1, message: errorMessage}
        }

        return {
            ...retVal,
            errors: 1,
            message: `Failed to copy ${srcFile}: ${error.message}`,
        }
    }
}

/**
 * Copy files from source globs to destination
 * @param globs Source file globs
 * @param dest Destination directory
 * @param opts Copy options
 * @returns Copy operation result
 */
export function copyGlob(globs: Glob, dest: string, opts: CopyOptions = {}): CopyResult {
    const retVal = {...defaultCopyResult, srcPath: globs.toString(), destPath: dest}
    globs = arrayify(globs)

    // Input validation
    if (!isGlob(globs) || globs.length === 0) return defaultCopyResult
    if (!dest || typeof dest !== 'string') {
        throw new Error('dest parameter must be a non-empty string')
    }

    const logger = opts.logger ?? console.log
    if (opts.logLevel !== 'silent') logger(`copy:['${arrayify(globs).join(', ')}'] => '${dest}':`)

    const firstPositiveGlob = globs.find(g => !g.startsWith('!'))
    const globBase = firstPositiveGlob ? globParent(firstPositiveGlob) : '.'
    const filesToCopy = globbySync(globs)

    const errorMessages: string[] = []
    for (const [index, srcFile] of filesToCopy.entries()) {
        const relSrc = path.relative(globBase, path.dirname(srcFile))
        const destPath = path.join(dest, relSrc)
        fs.mkdirSync(path.dirname(destPath), {recursive: true})

        const result = copyFile(srcFile, destPath, {...opts, prefix: `  ${index + 1}) `})
        retVal.copied += result.copied
        retVal.skipped += result.skipped
        retVal.errors += result.errors

        if (result.errors > 0) {
            errorMessages.push(result.message)
            if (opts.logLevel !== 'silent') logger(`  ${index + 1}) ERROR: ${result.message}`)
        }
    }

    if (retVal.errors > 0) retVal.message = errorMessages.join('\n')
    logStats(retVal, opts)

    return retVal
}

/**
 * Copy files from multiple sources to multiple destinations.
 *
 * @param globs glob string or list of glob strings
 * @param opts CopyOptions
 */
export function copyParam(params: CopyParam | CopyParam[], opts: CopyOptions): CopyResult {
    const retVal = {...defaultCopyResult}
    for (const param of arrayify(params)) {
        const ret = copyGlob(param.src, param.dest, opts)
        retVal.copied += ret.copied
        retVal.skipped += ret.skipped
        retVal.errors += ret.errors
        if (ret.errors > 0) {
            const separtor = retVal.message.length > 0 ? '\n' : ''
            retVal.message += `${separtor}${ret.message}`
        }
    }

    logStats(retVal, opts)

    return retVal
}

/**
 * Copy files from multiple sources to multiple destinations.
 *
 * @param globs glob string or list of glob strings
 * @param opts CopyOptions
 */
export function copy(globs: Glob, destPath: string, opts: CopyOptions): CopyResult

/**
 * Copy files from multiple sources to multiple destinations.
 *
 * @param params list of CopyParam (src to dest pairs)
 * @param opts CopyOptions
 */

export function copy(params: CopyParam | CopyParam[], opts?: CopyOptions): CopyResult

/**
 * Copy files from multiple sources to multiple destinations.
 *
 * @param arg1 src or CopyParams
 * @param arg2 dest or CopyParams
 * @param arg3 CopyOptions
 */

export function copy(
    arg1: Glob | CopyParam | CopyParam[],
    arg2?: string | CopyOptions,
    arg3?: CopyOptions,
): CopyResult

// --- implementation details
export function copy(
    arg1: Glob | CopyParam | CopyParam[],
    arg2?: string | CopyOptions,
    arg3: CopyOptions = {},
): CopyResult {
    if (isGlob(arg1)) return copyGlob(arg1, arg2 as string, arg3)
    const ret = copyParam(arg1, {...arg3, showStats: false})

    logStats(ret, {showStats: true, ...(arg2 as CopyOptions)})

    return ret
}

export default copy
