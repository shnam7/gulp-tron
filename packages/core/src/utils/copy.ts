import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {globbySync} from 'globby'
import type {LogOptions} from '../types.js'
import arrayify from './arrayify.js'

/** Type for copy parameter with source and destination */
export type CopyParam = {
    readonly src: string | string[]
    readonly dest: string
}

/** Type for copy options extending LogOptions */
export type CopyOptions = {
    readonly dryRun?: boolean
} & LogOptions

/** Type for single file operation result */
export type FileOperationResult = {
    readonly copied: boolean
    readonly error?: string
    readonly srcPath: string
    readonly destPath: string
}

/** Type for copy operation result */
export type CopyOperationResult = {
    readonly copied: number
    readonly skipped: number
    readonly errors: number
}

/**
 * Check if file needs to be copied based on modification time and size
 * @param srcStat Source file stats
 * @param destStat Destination file stats (undefined if doesn't exist)
 * @returns true if file should be copied
 */
export function shouldCopyFile(srcStat: fs.Stats, destStat: fs.Stats | undefined): boolean {
    return !destStat || srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size
}

/**
 * Generate result message for copy operations
 * @param copied Number of files copied
 * @param skipped Number of files skipped
 * @param errors Number of errors encountered
 * @returns Formatted result message
 */
export function generateCopyResultMessage(copied: number, skipped: number, errors: number): string {
    const pluralizedFile = copied === 1 ? 'file' : 'files'
    let message = `  >>>: ${copied} ${pluralizedFile} copied`

    if (skipped > 0) message += `, ${skipped} skipped (up-to-date)`
    if (errors > 0) message += `, ${errors} failed`

    return message + '.'
}

/**
 * Process single file copy operation
 * @param srcFile Source file path
 * @param dest Destination directory
 * @param index File index for logging
 * @param opts Copy options
 * @returns File operation result
 */
export function processSingleFileCopy(
    srcFile: string,
    dest: string,
    index: number,
    opts: CopyOptions,
): FileOperationResult {
    const logger = opts.logger ?? console.log
    const displayIndex = index + 1
    const relativeSrc = path.relative(process.cwd(), srcFile)
    const fileName = path.basename(srcFile)
    const destFile = path.resolve(dest, fileName)

    try {
        const srcStat = fs.statSync(srcFile)
        let destStat: fs.Stats | undefined

        try {
            destStat = fs.statSync(destFile)
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                return {
                    copied: false,
                    error: `Failed to stat destination: ${error.message}`,
                    srcPath: srcFile,
                    destPath: destFile,
                }
            }
        }

        const copyInfo = `  ${displayIndex}) ${relativeSrc} --> ${dest}`

        if (!shouldCopyFile(srcStat, destStat)) {
            if (opts.logLevel === 'verbose') logger(`${copyInfo} (already up-to-date)`)
            return {copied: false, srcPath: srcFile, destPath: destFile}
        }

        if (opts.logLevel === 'verbose') logger(copyInfo)
        if (opts.dryRun) return {copied: true, srcPath: srcFile, destPath: destFile}

        fs.mkdirSync(path.dirname(destFile), {recursive: true})
        fs.copyFileSync(srcFile, destFile)
        return {copied: true, srcPath: srcFile, destPath: destFile}
    } catch (error: any) {
        // Handle source file not found or other errors
        if (error.code === 'ENOENT' && error.path === srcFile) {
            return {
                copied: false,
                error: `Source file does not exist: ${relativeSrc}`,
                srcPath: srcFile,
                destPath: destFile,
            }
        }

        return {
            copied: false,
            error: `Failed to copy ${relativeSrc}: ${error.message}`,
            srcPath: srcFile,
            destPath: destFile,
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
export function copyFilesByGlobs(
    globs: string | string[],
    dest: string,
    opts: CopyOptions = {},
): CopyOperationResult {
    // Input validation
    if (!globs || (Array.isArray(globs) && globs.length === 0))
        return {copied: 0, skipped: 0, errors: 0}

    if (!dest || typeof dest !== 'string') {
        throw new Error('dest parameter must be a non-empty string')
    }

    const logger = opts.logger ?? console.log
    const filesToCopy = globbySync(globs)

    if (opts.logLevel !== 'silent') logger(`copy:['${arrayify(globs).join(', ')}'] => '${dest}':`)

    let actualCopyCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const [index, srcFile] of filesToCopy.entries()) {
        const result = processSingleFileCopy(srcFile, dest, index, opts)

        if (result.copied) actualCopyCount++
        else if (result.error) {
            errors.push(result.error)
            if (opts.logLevel !== 'silent') logger(`  ${index + 1}) ERROR: ${result.error}`)
        } else skippedCount++
    }

    // Report results
    if (opts.logLevel !== 'silent') {
        const resultMessage = generateCopyResultMessage(
            actualCopyCount,
            skippedCount,
            errors.length,
        )
        logger(resultMessage)

        // Log detailed errors if any
        if (errors.length > 0 && opts.logLevel === 'verbose')
            for (const error of errors) logger(`  ERROR: ${error}`)
    }

    return {copied: actualCopyCount, skipped: skippedCount, errors: errors.length}
}
