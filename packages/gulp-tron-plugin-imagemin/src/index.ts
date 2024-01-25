
import imagemin, { Options } from 'gulp-imagemin'
import { BuildStream } from 'gulp-tron'
import type { PluginFunction, PluginOptions } from 'gulp-tron'

const imageminPlugin = (opt?: PluginOptions): PluginFunction => {
    return (bs: BuildStream, opts: PluginOptions) => {
        imagemin(opt)
        return bs
    }
}

export default imageminPlugin
