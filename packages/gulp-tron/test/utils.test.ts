import { describe, expect, it, test } from 'vitest'
import { cloneStream } from '../dist/utils/utils'
import through from 'through2'
import vinyl from 'vinyl'

describe('cloneStream', () => {
    it('should clone files in the stream', () => {
        let sourceStream = cloneStream()
        let clonedStream = cloneStream()
        let count = 0
        sourceStream.pipe(clonedStream)

        sourceStream.on('data', data => {
            expect(String(data.contents)).toBe('source stream')
            expect(data.path).toBe('file.js')
            count++
        })

        clonedStream.pipe(
            through.obj((file, enc, cb) => {
                file.contents = Buffer.from('cloned stream')
                cb(null, file)
            }),
        )

        clonedStream.on('data', (data) => {
            expect(String(data.contents)).toBe('cloned stream')
            expect(data.path).toBe('file.js')
            count++
        })

        sourceStream.write(
            new vinyl({
                path: 'file.js',
                contents: Buffer.from('source stream'),
            }),
        )

        sourceStream.on('end', () => {
            expect(count).to.be.equal(2)
        })

        sourceStream.end()
    })
})
