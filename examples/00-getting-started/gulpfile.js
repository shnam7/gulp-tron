import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babelG from 'gulp-babel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const srcRoot = path.join(basePath, 'src')
const destRoot = path.join(basePath, 'dist')
const sassG = gulpSass(dartSass)

// --- statics
const statics = {
    name: 'statics',
    build: bs => bs.log('<static:build>').src().dest(),

    src: path.join(srcRoot, 'public/**'),
    dest: path.join(destRoot),
}

// --- styles
const scss = {
    name: 'scss',
    build: bs => bs.log('<scss:build>').src().pipe(sassG().on('error', sassG.logError)).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

// --- scripts
const scripts = {
    name: 'scripts',
    build: bs => bs.log('<scripts:build>').src().pipe(babelG()).dest(),

    src: path.join(srcRoot, 'js/**/*.js'),
    dest: path.join(destRoot, 'js'),
}

// --- main
const build = {
    name: '@build',
    triggers: tron.parallel(statics, scss, scripts),
    clean: path.join(destRoot),
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: path.join(destRoot, '**/*.html'),
        browserSync: {server: destRoot},
    })
