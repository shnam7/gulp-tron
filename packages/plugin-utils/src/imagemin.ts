
import imageminG, { Options } from 'gulp-imagemin'
import { BuildStream } from 'gulp-tron'

const imagemin = (opt?: Options) => {
    return (bs: BuildStream) => {
        imageminG(opt)
        return bs
    }
}

export default imagemin
