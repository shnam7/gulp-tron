
import { BuildStream } from 'gulp-tron'
import concatG from 'gulp-concat'

export type Options = { [key: string]: any }

const concat = (file: string | Object, options: any) => (bs: BuildStream) => {
    if (typeof file === 'string') return bs.pipe(concatG(file, options))
    return bs.pipe(concatG(options))
}


export default concat
