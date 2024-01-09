import fg from 'fast-glob'
import upath from 'upath'
import fs from "fs"
import through from 'through2'
import is from './typecheck.js'

export type Options = { [key: string]: any }

export const delay = (msec: number) => new Promise(resolve => setTimeout(resolve, msec))

export const arrayify = <T>(arg?: T | T[]): T[] => arg ? (is.Array(arg) ? arg : [arg]) : []

export const cloneStream = () => through.obj(function(file, enc, cb) { cb(null, file.clone()) })

/**
 * copy multi-glob files to single destination
 *
 * @param patterns glob patterns to copy.
 * @param destPath destination folder to copy to.
 * @returns
 */
export function copy(patterns: string | string[], destPath: string): void {
    patterns = arrayify(patterns)
    if (patterns.length === 0) return
    let promises: Promise<void>[] = []

    // ensure destination directory exists
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })

    patterns.forEach(pattern =>
        fg.globSync(pattern).forEach((file: string) => {
            const rd = fs.createReadStream(file)
            const wr = fs.createWriteStream(upath.join(destPath, upath.basename(file)))
            rd.pipe(wr)
        }))
    // patterns.forEach(pattern =>
    //     fg.globSync(pattern).forEach((file: string) => promises.push(new Promise((resolve, reject) => {
    //         const rd = fs.createReadStream(file).on('error', err => reject(err))
    //         const wr = fs.createWriteStream(upath.join(destPath, upath.basename(file)))
    //             .on('error', err => reject(err))
    //             .on('close', () => resolve())
    //         rd.pipe(wr)
    //     })))
    // )
    // return Promise.all(promises)
}


// //** load yml and json files
// export function loadData(globPatterns: string | string[]): Object {
//     if (is.String(globPatterns)) globPatterns = [globPatterns]
//     let data = {}
//     let yaml: any = undefined
//     globPatterns.forEach((globPattern: string) => {
//         fg.globSync(globPattern).forEach((file) => {
//             let ext = upath.extname(file).toLowerCase()
//             if (ext === '.yml' || ext === '.yaml') {
//                 if (!yaml) yaml = requireSafe('js-yaml')
//                 Object.assign(data, yaml.safeLoad(fs.readFileSync(file)))
//             }
//             else if (ext === '.json')
//                 Object.assign(data, JSON.parse(fs.readFileSync(file, 'utf-8')))
//             else
//                 throw Error(`Unknown data file extension: ${ext}`)
//         })
//     })
//     return data
// }


/**
 *  Add properties to object from directories
 *
 *  Usage examples:
 *  registerPropertiesFromFiles(obj, "./plugins") --> obj.xxx
 *  registerPropertiesFromFiles(obj.plugins={}, "./plugins") --> obj.plugins.xxx
*/
export function addProperty(obj: any, propName: string, propValue: any) {
    Object.defineProperty(obj, propName, {
        configurable: false,
        enumerable: true,
        get: propValue
    })
}

export function registerPropertiesFromFiles(obj: any, globPattern: string, callback?: (file: string) => string) {
    let files: string[] = []
    let cb = callback ? callback : (file: string) => upath.removeExt(file, '.js')

    fg.globSync(globPattern).forEach(file => files.push(cb(file)))
    files.forEach(file => addProperty(obj, upath.basename(file), () => require(file).default))
}
