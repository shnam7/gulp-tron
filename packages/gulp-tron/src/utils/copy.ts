import fg from 'fast-glob'
import path from 'path'
import fs from 'fs'
import arrayify from './arrayify.js'

export type CopyParam = { src: string | string[], dest: string }
export type CopyOptions = { logLevel?: 'verbose' | 'normal' | 'silent', logger?: (...args: any[]) => void }

/**
 * copy multi-glob files to single destination
 *
 * @param patterns glob patterns to copy.
 * @param destPath destination folder to copy to.
 * @returns
 */
export const copy = (patterns: string | string[], destPath: string, opts: CopyOptions = {}): number => {
    patterns = arrayify(patterns)
    if (patterns.length === 0) return 0

    // ensure destination directory exists
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })

    let count = 0
    patterns.forEach(pattern =>
        fg.globSync(pattern).forEach((file: string) => {
            const dest = path.join(destPath, path.basename(file))
            const rd = fs.createReadStream(file)
            const wr = fs.createWriteStream(dest)
            let copyInfo = `[${file}] => ${dest}`
            if (opts.logLevel !== 'silent') console.log(`copying:${copyInfo}`)
            rd.pipe(wr)
            count += 1
        }))
    return count
}

/**
 * Copy Files in batch mode
 *
 * @param param set of src and dest pairs to copy. single { src: [], dest:[] }, or array of it.
 * @param opts options
 * @returns number of files copied
 */
export const copyBatch = (param?: CopyParam | CopyParam[], opts: CopyOptions = {}): number => {
    if (!param) return 0   // allow null argument

    const logger = opts.logger || console.log
    let count = 0
    arrayify(param).forEach(target => {
        let copyInfo = `[${target.src}] => ${target.dest}`
        // if (opts.logLevel !== 'silent') logger(`[copying: ${copyInfo}`)
        count += copy(target.src, target.dest, opts)
    })
    return count
}
