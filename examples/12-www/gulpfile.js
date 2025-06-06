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
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 5000
const destZip = path.join(basePath, 'dist')

const concat = {
    name: 'concat',
    build: bs => bs.src().chain(concatP(bs.opts.outFile)).dest(),

    src: [path.join(basePath, 'assets/concat/*.js')],
    order: ['file2.js', '*.js'],
    dest: path.join(destRoot, 'js'),
    outFile: 'concated.js',
    clean: path.join(destRoot, 'js'),
}

const scss = {
    name: 'scss',
    build: bs => bs.src().chain(sassP()).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
    clean: path.join(destRoot, 'css'),
}

const images = {
    name: 'images',
    build(bs) {
        bs.src()
            .pipe(imageminG([imageminJPegTran()]))
            .dest()
    },

    src: path.join(srcRoot, 'images/**/*'),
    dest: path.join(destRoot, 'images'),
    clean: [path.join(destRoot, 'images')],
}

const zip = {
    name: 'zip',
    build: bs => bs.src().debug().pipe(zipG(bs.opts.outFile)).dest(),

    src: [path.join(destRoot, '**/*'), path.join(srcRoot, 'zip-me-too/**/*')],
    dest: destZip,
    outFile: '10-www.zip',
    watch: [], // disable watch by setting 'watch' to empty array
    clean: destZip,
}

// --- build
const build = {
    name: '@build',
    dependsOn: tron.series(tron.parallel(concat, scss, images), zip),
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
