import tron from 'gulp-tron'
import upath from 'upath'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babel from 'gulp-babel'

import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

const srcRoot = upath.join(basePath, 'assets')
const destRoot = upath.join(basePath, 'www')

const sass = gulpSass(dartSass)

const scss = {
    name: 'scss',
    builder: builder => builder.src().pipe(sass().on('error', sass.logError)).dest(),
    src: upath.join(srcRoot, 'scss/**/*.scss'),
    dest: upath.join(destRoot, 'css'),
}

const scripts = {
    name: 'babel',
    builder: builder => builder.src().pipe(babel()).dest(),
    src: upath.join(srcRoot, 'js/**/*.js'),
    dest: upath.join(destRoot, 'js'),
    npmInstall: ['@babel/core'],
}

const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: upath.join(destRoot, '{css,js}'),
}

const watcher = {
    name: '@watch',
    builder: 'watcher',
    watch: upath.join(destRoot, '**/*.html'),
    browserSync: { server: destRoot },
}

const cleaner = { name: '@clean', builder: 'cleaner' }

tron.createProject({ build, watcher, cleaner }, { prefix })
