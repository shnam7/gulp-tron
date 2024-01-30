import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import concat from 'gulp-concat'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 3500
const sourceMap = true

// // build configurations
// const coffee = {
//     name: 'coffee',
//     builder: 'GCoffeeScriptBuilder',
//     src: [path.join(srcRoot, 'coffee/**/*.coffee')],
//     order: ['*main.coffee'], // use order property to set outFile orders
//     dest: path.join(destRoot, 'js'), // dest: (file) => file.base,
//     outFile: 'sample-coffee.js',
//     buildOptions: {
//         babel: true,
//         lint: true,
//         sourceMap,
//         minify: true,
//     },
//     moduleOptions: {
//         // to enable uglify, coffee output need to be transpiled to es5 using babel by passing the options below
//         // TODO May 6, 2018
//         // If transpile option is given, gulp-coffee fails when sourcemaps are enabled.
//         // No solution found, so this option is blocked until the solution is found.
//         // gulp-coffee: v3.0.2, issue #91
//         // coffee: {transpile: {presets: ['@babel/env']}, sourceMap: true, inlineMap: true}
//     },
//     flushStream: true,
//     // npmInstall: ['@babel/preset-env']
// }

const jsModuleOptions = {
    eslint: {
        // "extends": "eslint:recommended",
        parserOptions: { ecmaVersion: 6 },
        rules: { strict: 1 },
    },
}

//
const javascript = {
    name: 'javascript',
    build: async bs => {
        const bs2 = bs.clone()
        bs.src().filter('*main*.js').debug()
        bs2.src().filter(['!*main*.js']).debug()
        bs.merge(bs2).filter([]).debug()

        // const first = bs.src(bs.opts.src).filter('*main*.js').cloneStream().pipe(debug())
        // const second = bs.src(bs.opts.src).filter('!*main*.js').cloneStream()
        // bs.clearStream().debug().merge(first).merge(second).debug()

        // .merge(bs.opts.src).debug().pipe(concat(bs.opts.outFile)).dest()
    },

    src: [path.join(srcRoot, 'js/**/*.js')],
    dest: path.join(destRoot, 'js'),
    // order: ['*main.js'],
    outFile: 'sample-js.js',
    // lint: true,
    minify: true,
    sourceMap,
    outFileOnly: true, // default value of outFileOnly is true
}

// const babel = {
//     name: 'babel',
//     builder: 'GJavaScriptBuilder',
//     src: [path.join(srcRoot, 'es6/**/*.es6')],
//     order: ['*main.es6'],
//     dest: path.join(destRoot, 'js'),
//     outFile: 'sample-es6.js',
//     buildOptions: {
//         babel: true,
//         // TODO gulp-eslint seems to have bug on dependencies
//         lint: true,
//         sourceMap,
//         minify: true,
//     },
//     moduleOptions: { eslint },
// }

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

// const build = {
//     name: '@build',
//     triggers: tron.parallel(coffee, javaScript, babel, typeScript),
//     clean: [path.join(destRoot, 'js'), `!${destRoot}`, `!${path.join(destRoot, 'index.html')}`],
// }

tron.task(javascript)

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
