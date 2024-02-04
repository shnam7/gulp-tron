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
    order: ['sub-2*.js'],
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

// const typeScript = {
//     name: 'typeScript',
//     builder: 'GTypeScriptBuilder',
//     src: [path.join(srcRoot, 'ts/**/!(*.d).ts')],
//     dest: path.join(destRoot, 'js'), // (file) => file.base,
//     outFile: 'app.js',
//     preBuild: rtb => {
//         rtb.copy({
//             src: path.join(srcRoot, 'ts/**/*.js'),
//             dest: path.join(destRoot, 'js'),
//         })
//     },

//     buildOptions: {
//         // lint: true,
//         // printConfig: true,
//         minify: true,
//         sourceMap,
//         // outFileOnly: false, --> this option is not supported in TypeScript builder
//         // You can specify tsconfig.json file here. To create a default one, run 'tsc -init'
//         tsConfig: path.join(basePath, 'tsconfig.json'),
//     },
//     moduleOptions: {
//         // this will override the tsConfig property settings in buildOptions
//         typescript: {
//             // "target": "es5",
//             // "noImplicitAny": true,
//             // "noEmitOnError": true,
//             // "declaration": true,
//             // "lib": ['DOM', 'ES6', 'DOM.Iterable', 'ScriptHost']
//         },
//         tslint: {
//             configuration: {
//                 extends: 'tslint:recommended',
//             },
//         },
//     },
//     addWatch: [path.join(srcRoot, 'ts/**/*.js')],
//     npmInstall: ['@types/jquery'],
// }

const build = {
    name: '@build',
    triggers: tron.parallel(javascript, babel),
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
