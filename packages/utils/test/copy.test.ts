import { beforeEach, afterEach, describe, expect, it, test, vi } from 'vitest'
import { copy, copyBatch } from '../src/copy.js'
import fg from 'fast-glob'
import fs from 'fs'
import devNull from 'dev-null'
import { CopyOptions } from '../dist/copy.js'

let rdMock: any
let wrMock: any
let mkdirMock: any

beforeEach(() => {
    rdMock = vi.spyOn(fs, 'createReadStream')
    wrMock = vi.spyOn(fs, 'createWriteStream').mockImplementation(() => devNull() as fs.WriteStream)
    mkdirMock = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)
})

afterEach(() => {
    rdMock.mockRestore()
    wrMock.mockRestore()
    mkdirMock.mockRestore()
})


describe('copy', () => {
    it('allows empty array pattern.', () => {
        expect(copy([], './dummy/')).toBe(0)
        expect(rdMock).toHaveBeenCalledTimes(0)
        expect(wrMock).toHaveBeenCalledTimes(0)
    })

    it('returns number of files copied.', () => {
        const src = './node_modules/.vitest/**/*'
        const fileCount = fg.globSync(src).length
        expect(copy(src, './dummy/')).toBe(fileCount)
        expect(rdMock).toHaveBeenCalledTimes(fileCount)
        expect(wrMock).toHaveBeenCalledTimes(fileCount)
    })
})


describe('copyBatch', () => {
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)

    it('allowa calling with no arguments.', () => {
        expect(copyBatch()).toBe(0)
        expect(rdMock).toHaveBeenCalledTimes(0)
        expect(wrMock).toHaveBeenCalledTimes(0)
    })

    it('allows empty array param.', () => {
        expect(copyBatch([])).toBe(0)
        expect(rdMock).toHaveBeenCalledTimes(0)
        expect(wrMock).toHaveBeenCalledTimes(0)
    })

    it('returns number of files copied.', () => {
        const param = [
            { src: './node_modules/.vitest/**/*', dest: './dummy1/' },
            { src: './node_modules/.vitest/*', dest: './dummy2/' }
        ]
        const fileCount = param.reduce((sum, item) => sum += fg.globSync(item.src).length, 0)
        const logger = vi.fn((msg: string) => {})
        const opt: CopyOptions = { logLevel: 'verbose', logger }

        expect(copyBatch(param, opt)).toBe(fileCount)
        expect(rdMock).toHaveBeenCalledTimes(fileCount)
        expect(wrMock).toHaveBeenCalledTimes(fileCount)
    })
})
