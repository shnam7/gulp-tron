import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import {concatP} from '@gulp-tron/plugin-scripts'
import {sassP} from '@gulp-tron/plugin-styles'
import imageminG from 'gulp-imagemin'
import imageminJPegTran from 'imagemin-jpegtran'
import zipG from 'gulp-zip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

// --- common
const srcRoot = path.join(basePath, 'src')
const destRoot = path.join(basePath, 'dist')
const port = 5000

// --- statics
const statics = {
    name: 'statics',
    build: bs => bs.src().dest(),

    src: [path.join(srcRoot, 'public/**/*.*')],
    dest: destRoot,
}

// --- concat
const concat = {
    name: 'concat',
    build: bs => bs.src().chain(concatP(bs.opts.outFile)).dest(),

    src: [path.join(srcRoot, 'concat/*.js')],
    order: ['file2.js', '*.js'],
    dest: path.join(destRoot, 'js'),
    outFile: 'concated.js',
}

// --- scss
const scss = {
    name: 'scss',
    build: bs => bs.src().chain(sassP()).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

// --- images
const images = {
    name: 'images',
    build(bs) {
        bs.src()
            .pipe(imageminG([imageminJPegTran()]))
            .dest()
    },

    src: path.join(srcRoot, 'images/**/*'),
    dest: path.join(destRoot, 'images'),
}

// --- zip
const zip = {
    name: 'zip',
    build: bs => bs.src().debug().pipe(zipG(bs.opts.outFile)).dest(),

    src: [
        path.join(destRoot, '**/*'),
        path.join(srcRoot, 'zip-me-too/**/*'),
        `!${path.join(srcRoot, '*.zip')}`,
    ],
    dest: destRoot,
    outFile: '10-www.zip',
    watch: [], // disable watch by setting 'watch' to empty array
}

// --- build
const build = {
    name: '@build',
    dependsOn: tron.series(tron.parallel(statics, concat, scss, images), zip),
    clean: destRoot,
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: [path.join(destRoot, '**/*.html')], // watch files for reloader (no build actions)
        browserSync: {
            server: destRoot,
            port: port + Number.parseInt(prefix, 10),
            ui: {port: port + 100 + Number.parseInt(prefix, 10)},
        },
    })
