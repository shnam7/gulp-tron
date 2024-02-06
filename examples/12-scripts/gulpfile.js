import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import concat from 'gulp-concat'
import { default as babelG } from 'gulp-babel'
import terser from 'gulp-terser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 3500
const sourcemaps = '.'

// concat input files into single output file.
const javascript = {
    name: 'javascript',
    build: async bs => {
        bs.src().order().debug().pipe(concat(bs.opts.outFile)).debug().dest()
    },

    src: [path.join(srcRoot, 'js/**/*.js')],
    dest: path.join(destRoot, 'js'),
    order: ['sub-1*.js'],
    sourcemaps,
    outFile: 'sample-js.js',
}

const eslintOptions = {
    // "extends": "eslint:recommended",
    parserOptions: { ecmaVersion: 6 },
    rules: { strict: 1 },
}

const babel = {
    name: 'babel',
    build: bs => {
        bs.src().debug().pipe(babelG()).debug().pipe(concat(bs.opts.outFile)).debug()
        bs.pipe(terser()).rename({ extname: '.min.js' }).debug().dest()
    },
    src: [path.join(srcRoot, 'es6/**/*.es6')],
    order: ['*main.es6'],
    dest: path.join(destRoot, 'js'),
    sourcemaps,
    outFile: 'sample-es6.js',
}

const typescript = {
    name: 'typescript',
    build: bs => bs.exec('tsc'),
}

const build = {
    name: '@build',
    triggers: tron.parallel(javascript, babel, typescript),
    clean: [path.join(destRoot, 'js'), `!${destRoot}`, `!${path.join(destRoot, 'index.html')}`],
}

tron.task(build).addCleaner()

// tron.createProject(build, { prefix })
//     .addCleaner()
//     .addWatcher({
//         watch: [path.join(destRoot, '**/*.html')],
//         browserSync: {
//             server: path.resolve(destRoot),
//             port: port + parseInt(prefix),
//             ui: { port: port + 100 + parseInt(prefix) },
//         },
//     })
