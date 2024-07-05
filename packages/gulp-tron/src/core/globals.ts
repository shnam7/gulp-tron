import gulp from 'gulp'
import type {GulpStream} from './types.js'

// eslint-disable-next-line import/no-mutable-exports
let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

// export async function streamToPromise(stream: GulpStream) {
//     return new Promise((resolve, reject) => {
//         if (stream.resume) stream.resume()

//         //   if (stream.readable)
//         //       stream.on('end', () => {
//         //           resolve(stream)
//         //       })
//         //   if (stream.writable)
//         stream.on('finish', () => {
//             resolve(null)
//         })
//     })
// }

export {_gulpInstance as gulp}
