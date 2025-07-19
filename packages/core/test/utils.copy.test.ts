import fs from 'node:fs'
import path from 'node:path'
import {globbySync} from 'globby'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    shouldCopyFile,
    generateCopyResultMessage,
    processSingleFileCopy,
    copyFilesByGlobs,
    type CopyOptions,
} from '../src/utils/copy.js'

// Mock dependencies
vi.mock('node:fs')
vi.mock('globby')

const mockedFs = vi.mocked(fs)
const mockedGlobby = vi.mocked(globbySync)

describe('Copy Utilities', () => {
    const mockLogger = vi.fn()
    const defaultOpts: CopyOptions = {logger: mockLogger, logLevel: 'normal'}

    beforeEach(() => {
        vi.clearAllMocks()
        mockLogger.mockClear()
    })

    describe('shouldCopyFile', () => {
        it('should handle all file comparison scenarios', () => {
            const srcStat = {mtimeMs: 1000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100}

            // No destination - should copy
            expect(shouldCopyFile(srcStat as fs.Stats, undefined)).toBe(true)

            // Identical files - should not copy
            expect(shouldCopyFile(srcStat as fs.Stats, destStat as fs.Stats)).toBe(false)

            // Newer source - should copy
            const newerSrc = {mtimeMs: 2000, size: 100}
            expect(shouldCopyFile(newerSrc as fs.Stats, destStat as fs.Stats)).toBe(true)

            // Different size - should copy
            const differentSize = {mtimeMs: 1000, size: 200}
            expect(shouldCopyFile(differentSize as fs.Stats, destStat as fs.Stats)).toBe(true)
        })
    })

    describe('generateCopyResultMessage', () => {
        it('should generate correct messages for various scenarios', () => {
            expect(generateCopyResultMessage(1, 0, 0)).toBe('  >>>: 1 file copied.')
            expect(generateCopyResultMessage(3, 0, 0)).toBe('  >>>: 3 files copied.')
            expect(generateCopyResultMessage(0, 1, 0)).toBe(
                '  >>>: 0 files copied, 1 skipped (up-to-date).',
            )
            expect(generateCopyResultMessage(0, 0, 1)).toBe('  >>>: 0 files copied, 1 failed.')
            expect(generateCopyResultMessage(2, 1, 1)).toBe(
                '  >>>: 2 files copied, 1 skipped (up-to-date), 1 failed.',
            )
        })
    })

    describe('processSingleFileCopy', () => {
        it('should copy file when needed', () => {
            const srcStat = {mtimeMs: 2000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100}

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValue(undefined)

            const result = processSingleFileCopy('src/test.js', './dest', 0, defaultOpts)

            expect(result.copied).toBe(true)
            expect(result.error).toBeUndefined()
            expect(mockedFs.copyFileSync).toHaveBeenCalled()
        })

        it('should skip up-to-date files', () => {
            const stats = {mtimeMs: 1000, size: 100}
            mockedFs.statSync.mockReturnValue(stats as fs.Stats)

            const result = processSingleFileCopy('src/test.js', './dest', 0, defaultOpts)

            expect(result.copied).toBe(false)
            expect(mockedFs.copyFileSync).not.toHaveBeenCalled()
        })

        it('should handle dry run mode', () => {
            const srcStat = {mtimeMs: 2000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100}

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)

            const result = processSingleFileCopy('src/test.js', './dest', 0, {
                ...defaultOpts,
                dryRun: true,
            })

            expect(result.copied).toBe(true)
            expect(mockedFs.copyFileSync).not.toHaveBeenCalled()
        })

        it('should handle various error scenarios', () => {
            // Test destination stat error
            const srcStat = {mtimeMs: 1000, size: 100}
            const error = new Error('Permission denied')
            ;(error as any).code = 'EACCES'

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockImplementationOnce(() => {
                    throw error
                })

            const result = processSingleFileCopy('src/test.js', './dest', 0, defaultOpts)
            expect(result.copied).toBe(false)
            expect(result.error).toContain('Failed to stat destination')

            // Test ENOENT error (file not found)
            vi.clearAllMocks()
            const enoentError = new Error('File not found')
            ;(enoentError as any).code = 'ENOENT'

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockImplementationOnce(() => {
                    throw enoentError
                })
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValue(undefined)

            const result2 = processSingleFileCopy('src/test.js', './dest', 0, defaultOpts)
            expect(result2.copied).toBe(true)
        })

        it('should handle verbose logging', () => {
            const srcStat = {mtimeMs: 2000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100}

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValue(undefined)

            processSingleFileCopy('src/test.js', './dest', 0, {
                ...defaultOpts,
                logLevel: 'verbose',
            })

            expect(mockLogger).toHaveBeenCalled()
        })
    })

    describe('copyFilesByGlobs', () => {
        it('should handle various copy scenarios', () => {
            // Test successful copy
            mockedGlobby.mockReturnValue(['src/file1.js', 'src/file2.js'])
            const srcStat = {mtimeMs: 2000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100}

            mockedFs.statSync
                .mockReturnValue(srcStat as fs.Stats)
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValue(undefined)

            const result = copyFilesByGlobs(['src/**/*.js'], './dest', defaultOpts)

            expect(result.copied).toBe(2)
            expect(result.skipped).toBe(0)
            expect(mockedFs.copyFileSync).toHaveBeenCalledTimes(2)

            // Test empty results
            vi.clearAllMocks()
            mockedGlobby.mockReturnValue([])

            const emptyResult = copyFilesByGlobs(['src/**/*.js'], './dest', defaultOpts)
            expect(emptyResult.copied).toBe(0)
            expect(emptyResult.skipped).toBe(0)
            expect(emptyResult.errors).toBe(0)
        })

        it('should handle mixed operation results', () => {
            mockedGlobby.mockReturnValue(['file1.js', 'file2.js', 'file3.js'])

            // File 1: copy, File 2: skip, File 3: error
            const srcStat1 = {mtimeMs: 2000, size: 100}
            const destStat1 = {mtimeMs: 1000, size: 100}
            const sameStats = {mtimeMs: 1000, size: 100}

            mockedFs.statSync
                .mockReturnValueOnce(srcStat1 as fs.Stats)
                .mockReturnValueOnce(destStat1 as fs.Stats)
                .mockReturnValueOnce(sameStats as fs.Stats)
                .mockReturnValueOnce(sameStats as fs.Stats)
                .mockReturnValueOnce(srcStat1 as fs.Stats)
                .mockReturnValueOnce(destStat1 as fs.Stats)

            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValueOnce(undefined).mockImplementationOnce(() => {
                throw new Error('Copy failed')
            })

            const result = copyFilesByGlobs('src/**/*.js', './dest', defaultOpts)

            expect(result.copied).toBe(1)
            expect(result.skipped).toBe(1)
            expect(result.errors).toBe(1)
        })

        it('should handle different log levels', () => {
            mockedGlobby.mockReturnValue(['file1.js'])
            const srcStat = {mtimeMs: 2000, size: 100}
            const destStat = {mtimeMs: 1000, size: 100} // Different so file will be copied

            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockReturnValue(undefined)

            // Test silent mode
            copyFilesByGlobs('src/**/*.js', './dest', {
                ...defaultOpts,
                logLevel: 'silent',
            })
            expect(mockLogger).not.toHaveBeenCalled()

            // Test verbose mode with error
            vi.clearAllMocks()
            mockedFs.statSync
                .mockReturnValueOnce(srcStat as fs.Stats)
                .mockReturnValueOnce(destStat as fs.Stats)
            mockedFs.mkdirSync.mockReturnValue(undefined)
            mockedFs.copyFileSync.mockImplementation(() => {
                throw new Error('Copy failed')
            })

            copyFilesByGlobs('src/**/*.js', './dest', {
                ...defaultOpts,
                logLevel: 'verbose',
            })
            expect(mockLogger).toHaveBeenCalledWith(
                expect.stringContaining('ERROR: Failed to copy'),
            )
        })
    })
})
