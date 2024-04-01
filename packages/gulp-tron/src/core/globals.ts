import gulp from 'gulp'
import { GulpStream } from './types.js'

let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

function streamToPromise(stream: GulpStream): Promise<GulpStream> {
    return new Promise((resolve, reject) => {
        stream.on('end', () => { resolve(stream) })
    })
}

export { _gulpInstance as gulp }
