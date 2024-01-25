import { describe, expect, it } from 'vitest'
import fg from 'fast-glob'
import path from 'path'
import { del } from '../src/index.js'

describe('del', () => {
    it('allows empty array patterns.', () => {
        console.log(del([], { dryRun: true }))
        expect(del([], { dryRun: true, logLevel: 'verbose' })).toStrictEqual([])
    })

    it('deletes directory as a single item.', () => {
        const src = './node_modules/.vitest'
        expect(del([src], { dryRun: true, logLevel: 'verbose' })).toStrictEqual(([path.resolve(src)]))
    })

    it('returns deleted files.', () => {
        const logger = (msg: string) => {}
        const srcList = fg.globSync('./node_modules/.vitest/**/*').sort()
        const results = srcList.map((src) => path.resolve(src)).sort()
        expect(del(srcList, { dryRun: true, logLevel: 'verbose', logger })).toStrictEqual(results)
    })
})
