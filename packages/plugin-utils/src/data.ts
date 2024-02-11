
import { BuildStream, LogOptions, PluginFunction, arrayify, is } from 'gulp-tron'
import { TransformCallback } from 'through2'
import type Vinyl from 'vinyl'
import dataG from 'gulp-data'
import yaml from 'js-yaml'
import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

export type Globs = string | string[]
export type DataObject<T extends {} = {}> = T & LogOptions
export type DataFunction = (file: Vinyl, callback: TransformCallback) => any
export type DataOptions = DataFunction | DataObject | Globs    // function returing data or data itself(any type)

export function loadData(patterns: Globs, options?: LogOptions): DataObject {
    let data = {}
    const logger = options?.logger || console.log
    arrayify(patterns).forEach((pattern) => {
        fg.globSync(pattern).forEach((file: string) => {
            let ext = path.extname(file).toLowerCase()
            if (ext === '.yml' || ext === '.yaml') {
                let yamlData = yaml.load(fs.readFileSync(file, 'utf8'))
                if (!is.Object(yamlData)) yamlData = { [path.parse(file).name]: yamlData }
                data = { ...data, ...(yamlData as Object) }
            }
            else if (ext === '.json')
                data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf-8')) }
            else
                throw Error(`Unknown data file extension: ${ext}`)
        })
    })
    if (options?.logLevel === 'verbose') logger(`loadData:${patterns}:`, data)
    return data
}

/**
 * Data plugin - wrapper for gulp-data (attach data to file.data)
 * @param data function returning data or any data
 * @returns PluginFunction
 */
export function dataP(func: Globs): PluginFunction
export function dataP(func: DataFunction): PluginFunction
export function dataP(obj: DataObject): PluginFunction
export function dataP(data: DataOptions): PluginFunction {
    return (bs: BuildStream) => {
        if (is.String(data) || is.Array(data)) {
            const logOptions = { logLevel: bs.opts.logLevel, logger: bs.logger }
            return bs.pipe(dataG(loadData(data as Globs, logOptions)))
        }
        return bs.pipe(dataG(data))
    }
}

export default dataP
