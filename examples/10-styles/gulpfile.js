import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import {
    pcssP,
    autoPrefixerP,
    sassP,
    stylelintScssP,
    cleanCssP,
    lessP,
    stylelintLessP,
    stylelintP,
    rtlcssP,
} from '@gulp-tron/plugin-styles'
import pcssPresetEnv from 'postcss-preset-env'
import pcssUtils from 'postcss-utilities'
import lost from 'lost'
import pcssGray from 'postcss-color-gray'
import pcssParserComment from 'postcss-comment'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName
const srcRoot = path.join(basePath, 'src')
const destRoot = path.join(basePath, 'dist')
const port = 5000
const sourcemaps = '.'

const stylelintOptions = {
    // extends: ['stylelint-config-recommended', './.stylelintrc'],
    rules: {
        // 'font-family-no-duplicate-names': true,
        // 'function-calc-no-unspaced-operator': null,

        // --- surpress warnings from less processing
        'property-no-unknown': null,

        // --- surpress warnings from postcss processing
        'selector-anb-no-unmatchable': null,
        'no-descending-specificity': null,
        'block-no-empty': null,
    },
    fix: true,
}

const stylelintOptionsScss = {
    ...stylelintOptions,
    extends: ['stylelint-config-standard-scss'],
}

const stylelintOptionsLess = {
    ...stylelintOptions,
    extends: ['stylelint-config-standard-less'],
}

const cleanCssoptions = {
    format: 'beautify', // default in cleanCssP
    // level: { 2: { mergeSemantically: true } },
}

// --- statics
const statics = {
    name: 'statics',
    build: bs => bs.log('<static:build>').src().dest(),

    src: path.join(srcRoot, 'public/**'),
    dest: path.join(destRoot),
}

// --- scss
const scss = {
    name: 'scss',
    build(bs) {
        bs.src()
            .chain(stylelintScssP(stylelintOptionsScss))
            .chain(sassP({includePaths: [path.join(srcRoot, 'scss')]}))
            .chain(pcssP(pcssPlugins))
            .chain(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .debug('scss:')
            .dest()
            .remove('*.map') // remove .map files for minification
            .chain(cleanCssP(cleanCssoptions))
            .rename({extname: '.min.css'})
            .debug('minify:')
            .dest()
    },

    src: [path.join(srcRoot, 'styles/scss/**/*.scss')],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    parser: 'scss',
}

// --- less
const less = {
    name: 'less',
    build(bs) {
        bs.src()
            .debug()
            .chain(stylelintLessP(stylelintOptionsLess))
            .chain(lessP({paths: [path.join(srcRoot, 'less')]}))
            .chain(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .remove('*.map') // remove .map files for minification
            .debug()
            .chain(cleanCssP(cleanCssoptions))
            .rename({extname: '.min.css'})
            .dest()
    },

    src: [path.join(srcRoot, 'styles/less/**/*.less')],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
}

// convert inline comments
const pcssPlugins = [pcssPresetEnv(), pcssUtils(), lost(), pcssGray({reserve: true})]

// --- postcss
const postcss = {
    name: 'postcss',
    build(bs) {
        bs.src()
            .chain(pcssP(pcssPlugins, {parser: pcssParserComment}))
            .debug()
            .chain(stylelintP(stylelintOptions))
            .chain(sassP({includePaths: [path.join(srcRoot, 'scss')]}))
            .chain(cleanCssP(cleanCssoptions))
            .chain(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .remove('*.map') // remove .map files for minification
            .debug()
            .chain(cleanCssP())
            .rename({extname: '.min.css'})
            .dest()
    },

    src: [path.join(srcRoot, 'styles/postcss/**/*.pcss')],
    dest: path.join(destRoot, 'css'),
}

// --- rtl
const rtl = {
    name: 'rtl',
    build: bs => bs.src().chain(rtlcssP()).rename({suffix: '-rtl'}).dest(),

    src: [path.join(destRoot, 'css/*.css'), `!${path.join(destRoot, 'css/**/*-rtl.css')}`],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    watch: [],
}

// --- build
const build = {
    name: '@build',
    dependsOn: tron.series(tron.parallel(statics, scss, less, postcss), rtl),
    clean: [path.join(destRoot)],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: [path.join(destRoot, '**/*.html')],
        browserSync: {
            server: path.resolve(destRoot),
            port: port + Number.parseInt(prefix, 10),
            ui: {port: port + 100 + Number.parseInt(prefix, 10)},
        },
    })
