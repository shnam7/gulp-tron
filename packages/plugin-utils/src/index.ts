import { BuildStream, TaskOptions } from 'gulp-tron'
import order from 'gulp-order'
import concat from './concat.js'

export type Options = TaskOptions & {
    order?: Parameters<typeof order>[0]
}

//--- BuildStream Utils
class BSUtils extends BuildStream {
    constructor(bs: BuildStream) {
        super(bs.name, bs.opts)
        this.merge(bs)
    }

    get opts() { return super.opts as Options }

    order(...args: Parameters<typeof order>) {
        if (!args[0]) args[0] = this.opts.order
        return this.pipe(order(...args))
    }

    concat(...args: Parameters<typeof concat>) {
        return this.pipe(concat(...args))
    }
}

export const bsUtils = (bs: BuildStream): BSUtils => new BSUtils(bs)
export { order, concat }
