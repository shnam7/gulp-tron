import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import {eslintP, terserP, concatP, coffeeP, coffeelintP, babelP} from '@gulp-tron/plugin-scripts'
import ts from 'gulp-typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName
const srcRoot = path.join(basePath, 'src')
const destRoot = path.join(basePath, 'dist')
const port = 3500
const sourcemaps = '.'

const eslintOptions = {
    overrideConfig: {
        extends: ['eslint:recommended', 'plugin:react/recommended'],
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            strict: 1,
            'no-unused-vars': 0,
            'react/react-in-jsx-scope': 'off',
        },
        env: {
            es6: true, // resolve 'Promise' is not defined error
            browser: true,
            node: true, // disable 'console not defined error'
        },
        settings: {
            react: {
                version: '999', // 'detect'
            },
        },
    },
    fix: true,
}

const terserOptions = {
    module: true, // enable es6
}

/** Static files */
const statics = {
    name: 'statics',
    build: bs => bs.src().dest(),

    src: ['static/**/*.*'],
    dest: destRoot,
}

/** Vanilla Javascript */
const vanilla = {
    name: 'vanilla',
    async build(bs) {
        bs.src()
            .chain(concatP(bs.opts.outFile))
            .chain(eslintP(eslintOptions)) //
            .dest()
    },

    src: [path.join(srcRoot, 'vanilla/**/*.js')],
    dest: path.join(destRoot, 'js'),
    order: ['sub-1*.js'],
    sourcemaps,
    outFile: 'vanilla.js',
}

const coffee = {
    name: 'coffee',
    build(bs) {
        bs.src()
            .chain(coffeelintP()) // lint first
            .chain(coffeeP())
            .chain(babelP())
            .chain(concatP(bs.opts.outFile))
            .dest()
            .remove('*.map') // exclude map files
            .chain(terserP())
            .rename({extname: '.min.js'})
            .dest()
    },
    src: [path.join(srcRoot, 'coffee/**/*.coffee')],
    order: ['*main.coffee'], // use order property to set outFile orders
    dest: path.join(destRoot, 'js/coffee'), // dest: (file) => file.base,
    outFile: 'main.js',
    sourcemaps,
}

const babelOptions = {
    // modules:false option isrequired to generate esm out (using import, not require())
    presets: [['@babel/preset-env', {modules: false}]],
}

const babel = {
    name: 'babel',
    build(bs) {
        bs.src()
            .chain(eslintP(eslintOptions)) // lint first
            .chain(babelP(babelOptions))
            .dest()
            .remove('*.map') // exclude map files
            .chain(terserP(terserOptions))
            .rename({extname: '.min.js'})
            .dest()
    },
    src: [path.join(srcRoot, 'babel/**/*.{js,es6}')],
    dest: path.join(destRoot, 'js/babel'),
    sourcemaps,
}

const typescript = {
    name: 'typescript',
    build(bs) {
        const tsProject = ts.createProject('src/tsconfig.json')
        bs.src().pipe(tsProject()).debug().changed().debug().dest()
    },

    src: [path.join(srcRoot, 'typescript/**/*.ts')],
    dest: path.join(destRoot, 'js/typescript'),
    addWatch: [path.join(srcRoot, 'tsconfig.json')],
    sourcemaps,
}

/** React with typescript */
const react = {
    name: 'react',
    build(bs) {
        const tsProject = ts.createProject('src/tsconfig.json')
        bs.src().pipe(tsProject()).changed().dest()
    },
    src: [path.join(srcRoot, 'react/**/*.{ts,tsx}')],
    dest: path.join(destRoot, 'js/react'),
    addWatch: [path.join(srcRoot, 'tsconfig.json')],
}

/** build */
const build = {
    name: '@build',
    triggers: tron.parallel(statics, vanilla, babel, coffee, typescript, react),
    clean: destRoot,
    // clean: [path.join(destRoot, 'js'), `!${destRoot}`, `!${path.join(destRoot, 'index.html')}`],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        // watch: [path.join(destRoot, '**/*.html')],
        browserSync: {
            server: path.resolve(destRoot),
            port: port + Number.parseInt(prefix, 10),
            ui: {
                port: port + 100 + Number.parseInt(prefix, 10),
            },
        },
        // logLevel: 'verbose',
    })
    .addWatcher({
        name: '@dev',
        watch: [path.join(destRoot, '**/*.html')],
        target: [`!static*`],
        dependsOn: build,
        logLevel: 'verbose',
    })
