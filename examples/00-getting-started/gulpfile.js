import tron from 'gulp-tron'
import path from 'path'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babel from 'gulp-babel'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')

const sass = gulpSass(dartSass)

const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sass().on('error', sass.logError)).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

const scripts = {
    name: 'scripts',
    build: bs => bs.src().pipe(babel()).dest(),

    src: path.join(srcRoot, 'js/**/*.js'),
    dest: path.join(destRoot, 'js'),
}

const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: path.join(destRoot, '{css,js}'),
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: path.join(destRoot, '**/*.html'),
        browserSync: { server: destRoot },
    })
