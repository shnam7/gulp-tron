// Sample

const tron = require('gulp-tron');
const upath = require('upath');

const basePath = upath.relative(process.cwd(), __dirname);
const srcRoot = upath.join(basePath, 'assets');
const destRoot = upath.join(basePath, 'www');
const projectName = upath.basename(__dirname);
const prefix = projectName + ':';
const port = 3500;
const sourceMap = true;

const eslint ={
    // "extends": "eslint:recommended",
    parserOptions: { "ecmaVersion": 6, },
    rules: { strict: 1 }
};


// build configurations
const coffee = {
    name: 'coffee',
    builder: 'GCoffeeScriptBuilder',
    src: [upath.join(srcRoot, 'coffee/**/*.coffee')],
    order: ['*main.coffee'],    // use order property to set outFile orders
    dest: upath.join(destRoot, 'js'), // dest: (file) => file.base,
    outFile: 'sample-coffee.js',
    buildOptions: {
        babel: true,
        lint: true,
        sourceMap,
        minify: true
    },
    moduleOptions: {
        // to enable uglify, coffee output need to be transpiled to es5 using babel by passing the options below
        // TODO May 6, 2018
        // If transpile option is given, gulp-coffee fails when sourcemaps are enabled.
        // No solution found, so this option is blocked until the solution is found.
        // gulp-coffee: v3.0.2, issue #91
        // coffee: {transpile: {presets: ['@babel/env']}, sourceMap: true, inlineMap: true}
    },
    flushStream: true,
    // npmInstall: ['@babel/preset-env']
};

const javaScript = {
    name: 'javaScript',
    builder: 'GJavaScriptBuilder',
    src: [upath.join(srcRoot, 'js/**/*.js')],
    order: ['*main.js'],
    dest: upath.join(destRoot, 'js'),
    outFile: 'sample-js.js',
    buildOptions: {
        lint: true,
        minify: true,
        sourceMap,
        outFileOnly: true // default value of outFileOnly is true
    },
    moduleOptions: { eslint },
};

const babel = {
    name: 'babel',
    builder: 'GJavaScriptBuilder',
    src: [upath.join(srcRoot, 'es6/**/*.es6')],
    order: ['*main.es6'],
    dest: upath.join(destRoot, 'js'),
    outFile: 'sample-es6.js',
    buildOptions: {
        babel: true,
        // TODO gulp-eslint seems to have bug on dependencies
        lint: true,
        sourceMap,
        minify: true
    },
    moduleOptions: { eslint },
};

const typeScript = {
    name: 'typeScript',
    builder: 'GTypeScriptBuilder',
    src: [upath.join(srcRoot, 'ts/**/!(*.d).ts')],
    dest: upath.join(destRoot, 'js'), // (file) => file.base,
    outFile: 'app.js',
    preBuild: (rtb) => {
        rtb.copy({
            src: upath.join(srcRoot, 'ts/**/*.js'), dest: upath.join(destRoot, 'js')
        });
    },

    buildOptions: {
        // lint: true,
        // printConfig: true,
        minify: true,
        sourceMap,
        // outFileOnly: false, --> this option is not supported in TypeScript builder
        // You can specify tsconfig.json file here. To create a default one, run 'tsc -init'
        tsConfig: upath.join(basePath, 'tsconfig.json')
    },
    moduleOptions: {
        // this will override the tsConfig property settings in buildOptions
        typescript: {
            // "target": "es5",
            // "noImplicitAny": true,
            // "noEmitOnError": true,
            // "declaration": true,
            // "lib": ['DOM', 'ES6', 'DOM.Iterable', 'ScriptHost']
        },
        tslint: {
            configuration: {
                "extends": "tslint:recommended"
            }
        },
    },
    addWatch: [upath.join(srcRoot, 'ts/**/*.js')],
    npmInstall: ['@types/jquery']
}

const build = {
    name: '@build',
    triggers: tron.parallel(coffee, javaScript, babel, typeScript),
    clean: [ upath.join(destRoot, 'js'), `!${destRoot}`,`!${upath.join(destRoot, 'index.html')}` ]
}


tron.createProject(build, {prefix})
    .addCleaner()
    .addWatcher({
        watch: [upath.join(destRoot, "**/*.html")],
        browserSync: {
            server: upath.resolve(destRoot),
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) }
        }
    });
