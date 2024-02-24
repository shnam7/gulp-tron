import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

//--- babel
import { eslintP } from '@gulp-tron/plugin-scripts'
const eslintOptions = {
    overrideConfig: {
        extends: ['eslint:recommended', 'plugin:react/recommended'],
        parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module',
        },
        rules: {
            strict: 1,
            'no-unused-vars': 0,
            'react/react-in-jsx-scope': 'off',
        },
        env: {
            browser: true,
            node: true, // disable 'console not defined error'
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    fix: true,
}

//--- babel
import { babelP } from '@gulp-tron/plugin-scripts'

//--- coffeescript
import { coffeeP } from '@gulp-tron/plugin-scripts'

//--- terser (minify)
import { terserP } from '@gulp-tron/plugin-scripts'

//--- concat
import { concatP, coffeelintP } from '@gulp-tron/plugin-scripts'

//--- common
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const port = 3500
const sourcemaps = '.'

// concat input files into single output file.
const javascript = {
    name: 'javascript',
    build: async bs => {
        bs.src() //
            // .debug()
            .pipe(eslintP(eslintOptions))
            .pipe(concatP(bs.opts.outFile))
            // .debug()
            .dest()
    },

    src: [path.join(srcRoot, 'js/**/*.js')],
    dest: path.join(destRoot, 'js'),
    order: ['sub-1*.js'],
    sourcemaps,
    outFile: 'plain-js.js',
}

const coffee = {
    name: 'coffee',
    build: bs => {
        bs.src()
            // .debug()
            .pipe(coffeelintP()) // lint first
            .pipe(coffeeP())
            .pipe(babelP())
            .pipe(concatP(bs.opts.outFile))
            .dest()
            .filter() // exclude map files
            .pipe(terserP())
            .rename({ extname: '.min.js' })
            .dest()
    },
    src: [path.join(srcRoot, 'coffee/**/*.coffee')],
    order: ['*main.coffee'], // use order property to set outFile orders
    dest: path.join(destRoot, 'js'), // dest: (file) => file.base,
    outFile: 'sample-coffee.js',
    sourcemaps,
}

const babel = {
    name: 'babel',
    build: bs => {
        bs.src()
            .order(['hello.jsx'])
            .pipe(eslintP(eslintOptions)) // lint first
            // .debug()
            .pipe(babelP({ presets: [['@babel/preset-react', {}]] }))
            // .pipe(babelP({ presets: [['@babel/preset-react', { runtime: 'automatic', importSource: 'custom-jsx-library' }]] }))
            .dest()

        // .pipe(concatP(bs.opts.outFile))
        // .debug()
        // .pipe(terserP())
        // .rename({ extname: '.min.js' })
        // .debug()
        // .dest()
    },
    src: [path.join(srcRoot, 'babel/**/*.{es6,jsx}')],
    order: ['*main.es6'],
    dest: path.join(destRoot, 'js'),
    sourcemaps,
    outFile: 'babel-test.js',
}

const typescript = {
    name: 'typescript',
    build: bs => bs.exec('tsc'),
    watch: [path.join(srcRoot, 'ts/**/*.{ts,tsx}'), './tsconfig.json'],
}

const build = {
    name: '@build',
    triggers: tron.parallel(javascript, babel, coffee, typescript),
    clean: [path.join(destRoot, 'js'), `!${destRoot}`, `!${path.join(destRoot, 'index.html')}`],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: [path.join(destRoot, '**/*.html')],
        browserSync: {
            server: path.resolve(destRoot),
            port: port + parseInt(prefix),
            ui: {
                port: port + 100 + parseInt(prefix),
            },
        },
        triggers: build,
        logLevel: 'verbose',
    })
    .addWatcher({
        name: '@dev',
        watch: [path.join(destRoot, '**/*.html')],
        target: tron.selectTasksAll(),
        triggers: build,
        logLevel: 'verbose',
    })
