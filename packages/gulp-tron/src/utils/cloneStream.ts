/**
 * Creates a cloned stream, preserving the current stream.
 *
 * @returns Cloned stream
 */
import through2 from 'through2'

export const cloneStream = () => through2.obj(function(file, enc, cb) { cb(null, file.clone()) })

export default cloneStream
