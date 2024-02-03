import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import myScss from './gulp-tron-plugins/my-scss.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const sassOpts = { includePaths: ['./scss/lib'] }

//--- custom plugin
const hello = msg => bs => {
    console.log(`${bs.name}:${msg}: custom plugin is running`)
    return bs.stream
}

const customPlugin = {
    name: 'custom-plugin',
    build: bs => bs.pipe(hello('Hello!')),
}

const customScss = {
    name: 'custom-scss',
    build: bs => bs.src().pipe(myScss(sassOpts)).dest(),

    src: path.join(basePath, 'scss/*.scss'),
    dest: file => file.base,
    sourcemaps: '.',
    clean: [path.join(basePath, 'scss/*.{css,map}')],
}

tron.task({
    name: '@build',
    triggers: tron.parallel(customPlugin, customScss),
}).addCleaner()
