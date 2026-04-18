import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import copy, {
    copyFile,
    copyGlob,
    copyParam,
    type CopyParam,
    type CopyOptions,
    type CopyResult,
} from '../../src/utils/copy.js'

const tmpDir = path.join(os.tmpdir(), 'copy-util-test')
const srcDir = path.join(tmpDir, 'src')
const srcSubDir = path.join(srcDir, 'sub')
const destDir = path.join(tmpDir, 'dest')
const destSubDir = path.join(destDir, 'sub')
const fileA = path.join(srcDir, 'a.txt')
const fileB = path.join(srcDir, 'b.txt')
const fileC = path.join(srcSubDir, 'c.txt')

function setupFiles() {
    fs.mkdirSync(srcSubDir, {recursive: true})
    fs.writeFileSync(fileA, 'hello')
    fs.writeFileSync(fileB, 'world')
    fs.writeFileSync(fileC, 'sub')
    if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
        throw new Error('Test files not created')
    }
}

function cleanup() {
    try {
        fs.rmSync(tmpDir, {recursive: true, force: true})
    } catch {}
}

function cleanupDest() {
    try {
        fs.rmSync(destDir, {recursive: true, force: true})
    } catch {}
}

describe('Copy Utility', () => {
    beforeEach(() => {
        cleanup()
        setupFiles()
    })
    afterEach(() => {
        cleanup()
    })
    describe('copyFile', () => {
        it('should copy a single file', () => {
            const result = copyFile(fileA, destDir, {})
            expect(result.copied).toBe(1)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
        })
        it('should skip up-to-date file', () => {
            copyFile(fileA, destDir, {})
            const result = copyFile(fileA, destDir, {})
            expect(result.skipped).toBe(1)
        })
        it('should not skip when force option is given even if up-to-date', () => {
            copyFile(fileA, destDir, {})
            const result = copyFile(fileA, destDir, {force: true})
            expect(result.copied).toBe(1)
        })
        it('should not actually copy when dryRun option is given', () => {
            cleanupDest()
            const result = copyFile(fileA, destDir, {dryRun: true})
            expect(result.copied).toBe(1)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(false)
        })
        it('should returns error for missing source file', () => {
            const result = copyFile(path.join(srcDir, 'notfound.txt'), destDir)
            expect(result.errors).toBe(1)
            expect(result.message).toMatch(/does not exist/v)
        })
    })

    describe('copyGlob', () => {
        beforeEach(() => {
            cleanupDest()
        })
        it('should copy files using glob string', () => {
            const src = path.join(srcDir, '{a,b}.txt')
            const result = copyGlob(src, destDir, {})
            expect(result.copied).toBe(2)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
            expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(true)
        })
        it('should copy files using glob string array', () => {
            const src = [path.join(srcDir, '{a,b}.txt')]
            const result = copyGlob(src, destDir, {})
            expect(result.copied).toBe(2)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
            expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(true)
        })
        it('should preserve directory structure when copying files using glob', () => {
            const src = [path.join(srcDir, '**/c.txt')]
            const result = copyGlob(src, destDir, {logLevel: 'verbose'})
            expect(result.copied).toBe(1)
            expect(fs.existsSync(path.join(destSubDir, 'c.txt'))).toBe(true)
        })
    })

    it('copies using CopyParam array', () => {
        const params: CopyParam[] = [
            {src: fileA, dest: destDir},
            {src: fileB, dest: destDir},
        ]
        const result = copyParam(params, {})
        expect(result.copied).toBe(2)
        expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
        expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(true)
    })

    describe('copy', () => {
        it('should copy single file', () => {
            const result = copy(fileA, destDir)
            expect(result.copied).toBe(1)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
        })
        it('should copy using glob file', () => {
            const result = copy(path.join(srcDir, '*.txt'), destDir)
            expect(result.copied).toBe(2)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
            expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(true)
        })
        it('should copy using CopyParam', () => {
            const params: CopyParam = {src: path.join(srcDir, '**'), dest: destDir}
            const result = copy(params)
            expect(result.copied).toBe(3)
            expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(true)
            expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(true)
            expect(fs.existsSync(path.join(destSubDir, 'c.txt'))).toBe(true)
        })
    })
})
