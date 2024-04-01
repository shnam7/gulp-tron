import { GulpStream } from '../index.js'

export default function streamToPromise(stream: GulpStream): Promise<GulpStream> {
    return new Promise(async (resolve, reject) => {
        stream.on('end', () => { resolve(stream) })
    })
}
