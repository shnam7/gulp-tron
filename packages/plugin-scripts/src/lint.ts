/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, GulpStream } from 'gulp-tron'
import eslintG from 'gulp-eslint-new'

export type Options = {
    formatter?: Parameters<typeof eslintG.format>[0]
} & eslintG.GulpESLintOptions

//--- custom plugin
const lint = (options: Options) => (bs: BuildStream) => {
    bs.pipe(eslintG(options))
        .pipe(eslintG.format())
        .pipe(eslintG.failAfterError())
    return bs.stream
}

export default lint
