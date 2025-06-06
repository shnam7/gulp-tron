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
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 5000
const sourcemaps = '.'

const stylelintOptions = {
    // extends: ['stylelint-config-recommended', './.stylelintrc'],
    extends: ['stylelint-config-recommended'],
    rules: {
        // 'font-family-no-duplicate-names': true,
        // 'function-calc-no-unspaced-operator': null,

        // --- surpress warnings from less processing
        'property-value-no-unknown': null,

        // --- surpress warnings from postcss processing
        'selector-anb-no-unmatchable': null,
        'no-descending-specificity': null,
        'block-no-empty': null,
    },
    fix: true,
}

const cleanCssoptions = {
    format: 'beautify', // default in cleanCssP
    // level: { 2: { mergeSemantically: true } },
}

const scss = {
    name: 'scss',
    build(bs) {
        bs.src()
            .chain(stylelintScssP(stylelintOptions))
            .chain(sassP({includePaths: ['assets/scss']}))
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

    src: [path.join(srcRoot, 'scss/**/*.scss')],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    parser: 'scss',
}

const less = {
    name: 'less',
    build(bs) {
        bs.src()
            .debug()
            .chain(stylelintLessP(stylelintOptions))
            .chain(lessP({paths: ['assets/less']}))
            .chain(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .remove('*.map') // remove .map files for minification
            .debug()
            .chain(cleanCssP(cleanCssoptions))
            .rename({extname: '.min.css'})
            .dest()
    },

    src: [path.join(srcRoot, 'less/**/*.less')],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
}
// convert inline comments
const pcssPlugins = [pcssPresetEnv(), pcssUtils(), lost(), pcssGray({reserve: true})]

const postcss = {
    name: 'postcss',
    build(bs) {
        bs.src()
            .chain(pcssP(pcssPlugins, {parser: pcssParserComment}))
            .debug()
            .chain(stylelintP(stylelintOptions))
            .chain(sassP({includePaths: ['assets/scss']}))
            .chain(cleanCssP(cleanCssoptions))
            .chain(autoPrefixerP()) // defaults: > 0.5%, last 2 versions, Firefox ESR, not dead.
            .dest()
            .remove('*.map') // remove .map files for minification
            .debug()
            .chain(cleanCssP())
            .rename({extname: '.min.css'})
            .dest()
    },

    src: [path.join(srcRoot, 'postcss/**/*.pcss')],
    dest: path.join(destRoot, 'css'),
}

const rtl = {
    name: 'rtl',
    build: bs => bs.src().chain(rtlcssP()).rename({suffix: '-rtl'}).dest(),

    src: [path.join(destRoot, 'css/*.css'), `!${path.join(destRoot, 'css/**/*-rtl.css')}`],
    dest: path.join(destRoot, 'css'),
    sourcemaps,
    watch: [],
}

/** build */
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
            port: port + Number.parseInt(prefix, 10),
            ui: {port: port + 100 + Number.parseInt(prefix, 10)},
        },
    })
