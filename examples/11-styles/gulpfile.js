import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

//--- stylelint
import { stylelintP, stylelintScssP, stylelintLessP } from '@gulp-tron/plugin-styles'
const stylelintOptions = {
    // extends: ['stylelint-config-recommended', './.stylelintrc'],
    extends: ['stylelint-config-recommended'],
    rules: {
        'font-family-no-duplicate-names': true,
        'function-calc-no-unspaced-operator': null,
        'no-descending-specificity': null,
        'selector-anb-no-unmatchable': null,
    },
    fix: true,
}

//-- sass/less moduiles
import { sassP, lessP } from '@gulp-tron/plugin-styles'

//--- autoprefixer
import { autoPrefixerP } from '@gulp-tron/plugin-styles'

//-- postcss
import { pcssP } from '@gulp-tron/plugin-styles'
import pcssPresetEnv from 'postcss-preset-env'
import pcssUtils from 'postcss-utilities'
import lost from 'lost'
import pcssGray from 'postcss-color-gray'
import pcssParserComment from 'postcss-comment' // convert inline comments
const pcssPlugins = [pcssPresetEnv(), pcssUtils(), lost(), pcssGray({ reserve: true })]

//--- css minify
import { cleanCssP } from '@gulp-tron/plugin-styles'
const cleanCssoptions = {
    format: 'beautify', // default in cleanCssP
    // level: { 2: { mergeSemantically: true } },
}

//--- rtlcss
import { rtlcssP } from '@gulp-tron/plugin-styles'

//--- common setrtings
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 5000
const sourcemaps = '.'

//-----------------------------------------------------------------------------

const scss = {
    name: 'scss',
    build: bs => {
        bs.src()
            .pipe(stylelintScssP(stylelintOptions))
            .debug()
            .pipe(sassP({ includePaths: ['assets/scss'] }))
            .pipe(pcssP(pcssPlugins))
            .pipe(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .filter() // remove .map files for minification
            .debug()
            .pipe(cleanCssP())
            .rename({ extname: '.min.css' })
            .dest()
    },

    src: [path.join(srcRoot, 'scss/**/*.scss')],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    parser: 'scss',
}

const less = {
    name: 'less',
    build: bs => {
        bs.src()
            .debug()
            .pipe(stylelintLessP(stylelintOptions))
            .pipe(lessP({ paths: ['assets/less'] }))
            .pipe(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .filter() // remove .map files for minification
            .debug()
            .pipe(cleanCssP())
            .rename({ extname: '.min.css' })
            .dest()
    },

    src: [path.join(srcRoot, 'less/**/*.less')],
    dest: path.join(destRoot, 'css'),
}

const postcss = {
    name: 'postcss',
    build: bs => {
        bs.src()
            .pipe(pcssP(pcssPlugins, { parser: pcssParserComment }))
            .debug()
            .pipe(stylelintP(stylelintOptions))
            // .pipe(sassP({ includePaths: ['assets/scss'] }))
            .pipe(cleanCssP(cleanCssoptions))
            .pipe(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .filter() // remove .map files for minification
            .debug()
            .pipe(cleanCssP())
            .rename({ extname: '.min.css' })
            .dest()
    },

    src: [path.join(srcRoot, 'postcss/**/*.pcss')],
    dest: path.join(destRoot, 'css'),
}

const rtl = {
    name: 'rtl',
    build: bs => bs.src().pipe(rtlcssP()).rename({ suffix: '-rtl' }).dest(),

    src: [path.join(destRoot, 'css/*.css'), `!${path.join(destRoot, 'css/**/*-rtl.css')}`],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    watch: [],
}

const build = {
    name: '@build',
    dependsOn: tron.series(tron.parallel(scss, less, postcss), rtl),
    clean: [path.join(destRoot, 'css')],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: [path.join(destRoot, '**/*.html')],
        browserSync: {
            server: path.resolve(destRoot),
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) },
        },
    })
