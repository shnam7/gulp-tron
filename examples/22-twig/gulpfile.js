import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

//--- common
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'dist')
const port = 5000

//--- sass
import { sassP, cleanCssP } from '@gulp-tron/plugin-styles'

const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sassP()).pipe(cleanCssP()).rename({ extname: '.min.css' }).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

//--- typescript
import { terserP } from '@gulp-tron/plugin-scripts'
const scripts = {
    name: 'scripts',
    build: bs => {
        bs.exec(`tsc`)
            .src()
            .debug()
            .rename({ dirname: path.join(destRoot, 'js'), extname: '.js' })
            .pipe(terserP())
            .rename({ extname: '.min.js' })
            .debug()
            .dest()
    },

    src: path.join(srcRoot, 'scripts/**/*.ts'),
}

//--- twig
import { dataP } from '@gulp-tron/plugin-utils'
import twigG from 'gulp-twig'
import twigMarkdown from 'twig-markdown'
import htmlCleanG from 'gulp-htmlmin'
import prettierG from 'gulp-prettier'

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
            func: function (args) {
                return 'the function'
            },
        },
    ],
    filters: [
        {
            name: 'nameOfFilter',
            func: function (args) {
                return 'the filter'
            },
        },
    ],
}

const twig = {
    name: 'twig',
    build: bs => {
        bs.src() //
            .pipe(dataP(path.join(srcRoot, 'twig/data/**/*.{yml,yaml,json}')))
            .debug()
            .pipe(twigG(twigOptions))
            .pipe(prettierG({ tabWidth: 4 }))
            .pipe(htmlCleanG({ collapseWhitespace: false }))
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
    logLevel: 'verbose',
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
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) },
        },
    })
