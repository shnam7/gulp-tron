/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream } from 'gulp-tron'
import rename from 'gulp-rename'
import terserG from 'gulp-terser'

export type Options = Parameters<typeof terserG>[0] & {
    rename: rename.Options
}

const minify = (options: Options) => (bs: BuildStream) => {
    const renameOptions = options.rename || { extname: '.min.js' }
    return bs.filter().pipe(terserG(options)).rename(renameOptions)
}

export default minify
