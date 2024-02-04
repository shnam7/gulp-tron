
import { BuildStream } from 'gulp-tron'
import eslint from './eslint.js'
import babel from './babel.js'
import minify from './minify.js'

//--- BuildStream Utils
class BSScripts extends BuildStream {
    constructor(bs: BuildStream) {
        super(bs.name, bs.opts)
        this.merge(bs)
    }

    eslint(...args: Parameters<typeof eslint>) {
        return this.pipe(eslint(...args))
    }

    babel(...args: Parameters<typeof babel>) {
        return this.pipe(babel(...args))
    }

    minify(...args: Parameters<typeof minify>) {
        return this.pipe(minify(...args))
    }
}

export const bsScripts = (bs: BuildStream): BSScripts => new BSScripts(bs)
export { eslint, babel, minify }
