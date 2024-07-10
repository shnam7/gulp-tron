import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import {sassP, cleanCssP} from '@gulp-tron/plugin-styles'
import {terserP} from '@gulp-tron/plugin-scripts'
import ts from 'gulp-typescript'
import {dataP} from '@gulp-tron/plugin-utils'
import twigG from 'gulp-twig'
import twigMarkdown from 'twig-markdown'
import htmlCleanG from 'gulp-htmlmin'
import prettierG from 'gulp-prettier'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

// --- common
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'dist')
const port = 5000

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

const twigOptions = {
    base: path.join(srcRoot, 'twig/templates'), // data can be a glob string or array of strings or data object
    // To use live reload on changes in data, yml or json file should be used
    // data: path.join(srcRoot, 'data/**/*.{yml,yaml,json}'),
    //   {
    //   site: {
    //     name: 'gulp-tron sample - Twig',
    //     charset: 'UTF-8',
    //     url:'.'
    //   }
    // },
    extend: twigMarkdown,
    functions: [
        {
            name: 'nameOfFunction',
            func(_args) {
                return 'the function'
            },
        },
    ],
    filters: [
        {
            name: 'nameOfFilter',
            func(_args) {
                return 'the filter'
            },
        },
    ],
}

const twig = {
    name: 'twig',
    build(bs) {
        bs.src() //
            .chain(dataP(path.join(srcRoot, 'twig/data/**/*.{yml,yaml,json}')))
            .debug()
            .pipe(twigG(twigOptions))
            .pipe(prettierG({tabWidth: 4}))
            .pipe(htmlCleanG({collapseWhitespace: false}))
            .dest()
    },

    src: [path.join(srcRoot, 'twig/pages/**/*.twig')],
    dest: destRoot,

    addWatch: [
        // include sub directories to detect changes of the file which are not in src list.
        path.join(srcRoot, 'twig/templates/**/*.twig'),
        path.join(srcRoot, 'twig/markdown/**/*.md'),
        path.join(srcRoot, 'twig/data/**/*.{yml,yaml,json}'),
    ],
    // logLevel: 'verbose',
}

const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts, twig),
    clean: destRoot,
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        browserSync: {
            server: path.resolve(destRoot),
            port: port + Number.parseInt(prefix, 10),
            ui: {port: port + 100 + Number.parseInt(prefix, 10)},
        },
    })
