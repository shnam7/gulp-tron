
import { BuildStream, PluginFunction } from 'gulp-tron'
import concatG from 'gulp-concat'

export type IOptions = { newLine: string }
export type IVinylOptions = Parameters<typeof concatG>[0]

const concat = (file: string | IVinylOptions, options?: IOptions): PluginFunction => (bs: BuildStream) => {
    if (typeof file === 'string') return bs.pipe(concatG(file, options))
    return bs.pipe(concatG(file))
}

export default concat
