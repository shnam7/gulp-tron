/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream } from 'gulp-tron'
import babelG from 'gulp-babel'


// this is brought from @types/gulp-babel definition file
export type BabelOptions = {
    filename?: string | undefined
    filenameRelative?: string | undefined
    presets?: string[] | undefined
    plugins?: string[] | undefined
    highlightCode?: boolean | undefined
    only?: string | string[] | undefined
    ignore?: string | string[] | undefined
    auxiliaryCommentBefore?: any
    auxiliaryCommentAfter?: any
    sourceMaps?: any
    inputSourceMap?: any
    sourceMapTarget?: any
    sourceFileName?: any
    sourceRoot?: any
    moduleRoot?: any
    moduleIds?: any
    moduleId?: any
    getModuleId?: any
    resolveModuleSource?: any
    keepModuleIdExtesions?: boolean | undefined
    code?: boolean | undefined
    ast?: boolean | undefined
    compact?: any
    comments?: boolean | undefined
    shouldPrintComment?: any
    env?: any
    retainLines?: boolean | undefined
}

//--- custom plugin
const babel = (options: BabelOptions = {}) => (bs: BuildStream) => {
    const opts = { sourceMaps: bs.opts.sourcemaps, ...options }

    return bs.pipe(babelG(opts))
}

export default babel
