import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import myScss from './gulp-tron-plugins/my-scss.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

//--- project settings
const basePath = path.relative(process.cwd(), __dirname)
// const projectName = path.basename(__dirname)
// const prefix = projectName + ':'

const sassOpts = { includePaths: ['./scss/lib'] }

//--- custom plugin
const hello = msg => bs => {
    console.log(`${bs.name}:${msg}: custom plugin is running`)
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

tron.createTask({
    name: 'intercept-test',
    build: bs => {
        // take '*/css' files only
        bs.src()
            .debug()
            .intercept((file, cb) => {
                if (file.path.endsWith('.css')) cb(null, file)
                cb(null)
            })
            .debug()
    },
    src: [path.join(basePath, 'scss/*.*')],
})

tron.createTask({
    name: 'peek-test',
    build: bs => {
        // take '*/css' files only
        let cssFileCount = 0
        bs.src()
            .peek(
                file => {
                    if (file.path.endsWith('.css')) ++cssFileCount
                    // bs.log(file.path, cssFileCount)
                },
                () => {
                    bs.log(`cssFileCount=${cssFileCount}`)
                },
            )
            .debug()
    },
    src: ['./scss/*.*'],
})

tron.task({
    name: '@build',
    triggers: tron.parallel(customPlugin, customScss, 'intercept-test', 'peek-test'),
}).addCleaner()
