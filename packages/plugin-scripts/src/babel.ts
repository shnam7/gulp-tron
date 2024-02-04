/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream } from 'gulp-tron'
import babelG from 'gulp-babel'

export type BabelOptions = Parameters<typeof babelG>[0]

//--- custom plugin
const babel = (options: BabelOptions = {}) => (bs: BuildStream) => {
    const opts = { sourceMaps: bs.opts.sourcemaps, ...options }

    return bs.pipe(babelG(opts))
}

export default babel
