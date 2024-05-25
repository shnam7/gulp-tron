import gulp from 'gulp'
import type { GulpStream } from './types.js'

let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

export function streamToPromise(stream: GulpStream | null) {
    return stream
        ? new Promise((resolve, reject) => {
            if (stream.resume) stream.resume()
            if (stream.readable) stream.on('end', () => resolve(null))
            if (stream.writable) stream.on('finish', () => resolve(null))
        })
        : Promise.resolve()
}

export { _gulpInstance as gulp }
