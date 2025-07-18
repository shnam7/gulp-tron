import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron, {parallel} from '@gulp-tron/core'
import {sassP, cleanCssP} from '@gulp-tron/plugin-styles'
import {terserP} from '@gulp-tron/plugin-scripts'
import ts from 'gulp-typescript'
import paniniG from 'panini'
import htmlCleanG from 'gulp-htmlmin'
import prettierG from 'gulp-prettier'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName
const srcRoot = path.join(basePath, 'src')
const destRoot = path.join(basePath, 'dist')
const portBase = 5000

const paniniOptions = {
    root: path.join(srcRoot, 'panini/pages/'),
    layouts: path.join(srcRoot, 'panini/layouts/'),
    partials: path.join(srcRoot, 'panini/partials/'),
    data: path.join(srcRoot, 'panini/data/'),
    helpers: path.join(srcRoot, 'panini/helpers/'),
    pagelayouts: {
        // All pages inside src/pages/blog will use the blog.html layout
        // 'blog': 'blog'
    },
}

const statics = {
    name: 'static',
    build(bs) {
        bs.src().changed().dest()
    },
    src: [path.join(srcRoot, 'static/**/*')],
    dest: destRoot,
}

const panini = {
    name: 'panini',
    build(bs) {
        paniniG.refresh()
        bs.src()
            .pipe(paniniG(paniniOptions))
            .rename({extname: '.html'})
            .pipe(prettierG({tabWidth: 4}))
            .pipe(htmlCleanG({collapseWhitespace: false}))
            .dest()
    },

    // panini does not handle backslashes correctly, so replace them to slashPreloa
    src: [path.join(srcRoot, 'panini/pages/**/*')],
    dest: path.join(destRoot, ''),
    // include sub directories to detect changes of the file which are not in src list.
    watch: [path.join(srcRoot, 'panini/**/*')],
    // watch: [path.join(srcRoot, 'panini/**/*'), '!'+path.join(srcRoot, '{static,scripts,scss}/**/*')]
}

const scss = {
    name: 'scss',
    build: bs => bs.src().chain(sassP()).chain(cleanCssP()).rename({extname: '.min.css'}).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

const tsProject = ts.createProject('tsconfig.json', {declaration: true})
const scripts = {
    name: 'scripts',

    build(bs) {
        const files = new Map()
        const reExt = /\.(d\.)?[j,t]s$/
        bs.src()
            .peek(file => files.set(file.path.replace(reExt, ''), file))
            .pipe(tsProject())
            .peek(file => {
                const key = file.path.replace(reExt, '')
                const f = files.get(key)
                if (!file.stat && f) file.stat = f.stat
            })
            .debug('src:')

        bs.clone()
            .remove('*.d.ts')
            .debug('js stream:')
            .chain(terserP()) //
            .rename({extname: '.min.js'})
            .changed()
            .dest()
            .debug('js:')

        bs.filter('*.d.ts').dest().debug('dts:')
    },

    src: path.join(srcRoot, 'scripts/**/*.ts'),
    dest: path.join(destRoot, 'js'),
}

const build = {
    name: '@build',
    triggers: parallel(statics, panini, scss, scripts),
    clean: [destRoot],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        browserSync: {
            server: path.resolve(destRoot),
            port: portBase + Number.parseInt(prefix, 10),
            ui: {port: portBase + 100 + Number.parseInt(prefix, 10)},
        },
    })
