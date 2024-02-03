import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'

const sass = gulpSass(dartSass)

const myScss = options => bs => {
    console.log(`myScss called with options:`, options)
    bs.pipe(sass(options || {}))
    return bs.stream
}

export default myScss
