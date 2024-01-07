// Sample


const tron = require('gulp-tron');
const upath = require('upath');   // use path instead of upath to workaround windows/linux path notation issue

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';

const basePath = upath.relative(process.cwd(), __dirname);
const srcRoot = upath.join(basePath, 'assets');
const destRoot = upath.join(basePath, '_build');
const port = 5000;

const pages = {
    name: 'twig',
    builder: 'GTwigBuilder',
    src: [upath.join(srcRoot, 'pages/**/*.html')],
    dest: upath.join(destRoot, ''),
    buildOptions: { prettify: true },
}

const webpack = {
    name: 'webpack',
    builder: 'GWebpackBuilder',
    // src: [upath.join(srcRoot, 'scripts/ts/app.ts')],
    dest: upath.join(destRoot, 'js'),
    buildOptions: {
        printConfig: true,
        webpackConfig: upath.join(basePath, 'webpack.config.js')
    },
    moduleOptions: {
        webpack: {
            // settings here will be merged override webpackConfig file contents
        },
    },
    watch: [upath.join(srcRoot, 'scripts/ts/**/*.ts')],
    flushStream: true,
    npmInstall: ['ts-loader', '@types/jquery']
}

const build = {
    name: '@build',
    triggers: tron.parallel(pages, webpack),
    clean: destRoot
}


tron.createProject(build, { prefix })
    .addWatcher({
        browserSync: {
            server: upath.resolve(destRoot),
            open: true,
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) }
       }
    })
    .addCleaner();
