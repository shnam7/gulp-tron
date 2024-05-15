import gulp from 'gulp'
import type { GulpStream } from './types.js'

let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

export function streamToPromise(stream: GulpStream | null) {
    // stream.pipe(debug({ title: '', logger: () => {} } as unknown as {}))
    // return streamToPromiseG(stream)
    if (stream === null) return Promise.resolve()

    return new Promise((resolve, reject) => {
        if (stream.resume) stream.resume()
        stream.on('end', () => { resolve(stream) })
    })
}

export { _gulpInstance as gulp }
