/**
 *  gulp-tron plugin-javascript
 *
 */

import { BuildStream, PluginFunction } from 'gulp-tron'
import eslintG from 'gulp-eslint-new'

export type Options = {
    formatter?: Parameters<typeof eslintG.format>[0]
} & eslintG.GulpESLintOptions

//--- custom plugin
const eslint = (options: Options): PluginFunction => (bs: BuildStream) => {
    return bs.pipe(eslintG(options))
        .pipe(eslintG.format())
        .pipe(eslintG.failAfterError())
}

export default eslint
