import fg from 'fast-glob'
import path from 'path'
import fs from 'fs'
import arrayify from './arrayify.js'
import streamToPromise from 'stream-to-promise'
import { error } from 'console'

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
    const logger = opts.logger || console.log

    if (opts.logLevel !== 'silent') logger(`copying:['${patterns}' => '${destPath}']:`)
    // ensure destination directory exists
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })

    let count = 0
    patterns.forEach(pattern =>
        fg.globSync(pattern).forEach((file: string) => {
            const dest = path.join(destPath, path.basename(file))
            // let copyInfo = `[${file}] => ${dest}]`
            // if (opts.logLevel !== 'silent') logger(`copying:${copyInfo}`)
            let copyInfo = `'${file}' => '${dest}'`
            if (opts.logLevel !== 'silent') logger(`  ${copyInfo}`)
            fs.copyFileSync(file, dest)
            count += 1
        }))

    // if (opts.logLevel === 'verbose') logger(`copying:[${patterns} => ${destPath}]:${count} file(s) were copied.`)
    if (opts.logLevel !== 'silent') logger(`${count} file(s) were copied.`)
    return count
}
// export const copy = (patterns: string | string[], destPath: string, opts: CopyOptions = {}): number => {
//     patterns = arrayify(patterns)
//     if (patterns.length === 0) return 0

//     // ensure destination directory exists
//     if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })

//     let count = 0
//     patterns.forEach(pattern =>
//         fg.globSync(pattern).forEach(async (file: string) => {
//             const dest = path.join(destPath, path.basename(file))
//             // const rd = fs.createReadStream(file)
//             // const wr = fs.createWriteStream(dest).on('close', () => {
//             //     if (opts.logLevel !== 'silent') console.log(`copying:${copyInfo}`)
//             //     // console.log(`------ Copy done.`)
//             // })
//             let copyInfo = `[${file}] => ${dest}`
//             if (opts.logLevel !== 'silent') console.log(`copying:${copyInfo}`)
//             // await streamToPromise(rd.pipe(wr))
//             fs.copyFileSync(file, dest)

//             // fs.cp(file, dest, (error) => {
//             //     console.log(`Error in copying:${copyInfo}:${error}`)
//             // })
//             if (opts.logLevel !== 'silent') console.log(`copying:${copyInfo}-->done`)

//             count += 1
//         }))
//     return count
// }

/**
 * Copy Files in batch mode
 *
 * @param param set of src and dest pairs to copy. single { src: [], dest:[] }, or array of it.
 * @param opts options
 * @returns number of files copied
 */
export const copyBatch = (param?: CopyParam | CopyParam[], opts: CopyOptions = {}): number => {
    if (!param) return 0   // allow null argument

    // const logger = opts.logger || console.log
    let count = 0
    arrayify(param).forEach(async target => {
        let copyInfo = `[${target.src}] => ${target.dest}`
        // if (opts.logLevel !== 'silent') logger(`[copying: ${copyInfo}`) --> this will be handled in
        count += copy(target.src, target.dest, opts)
    })
    return count
}
