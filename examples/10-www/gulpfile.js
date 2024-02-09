import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import concatG from 'gulp-concat'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import imageminG from 'gulp-imagemin'
import imageminJPegTran from 'imagemin-jpegtran'
import zipG from 'gulp-zip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 5000

const sassG = gulpSass(dartSass)
const destZip = path.join(basePath, '_dist')

const concat = {
    name: 'concat',
    build: bs => bs.src().pipe(concatG(bs.opts.outFile)).dest(),

    src: [path.join(basePath, 'concat/*.js')],
    order: ['file2.js', '*.js'],
    dest: path.join(destRoot, 'js'),
    outFile: 'concated.js',
    clean: path.join(destRoot, 'js'),
}

const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sassG()).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
    clean: path.join(destRoot, 'css'),
}

const images = {
    name: 'images',
    build: bs =>
        bs
            .src()
            .pipe(imageminG([imageminJPegTran()]))
            .dest(),

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
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) },
        },
    })
