const tron = require('gulp-tron');
const upath = require('upath');

const projectName = upath.basename(__dirname); // set template name to parent directory name
const basePath = upath.relative(process.cwd(), __dirname);  // project root directory
const srcRoot = upath.join(basePath, '_assets');
const destRoot = upath.join(basePath, '_site');
const prefix = projectName + ':';
const baseUrl = '/' + projectName;      // '/25-jekyll'

const sourceMap = true;
const jekyllTrigger = upath.join(basePath, '.jekyll-trigger');  // flag to trigger jekyll watcher
const port = 3125;

const scss = {
    name: 'scss',
    builder: 'GCSSBuilder',
    src: upath.join(srcRoot, 'scss/**/*.scss'),
    dest: upath.join(basePath, 'css'),
    buildOptions: {
        minifyOnly: true,
        lint: true,
        sourceMap: sourceMap
    },
    moduleOptions: {
        sass: { includePaths: ['scss', 'node_modules'] },
    },
    postBuild: rtb => rtb.exec(`echo > ${jekyllTrigger}`),
    clean: [upath.join(basePath, 'css')],
    flushStream: true,
}

const scripts = {
    name: 'scripts',
    builder: 'GTypeScriptBuilder',
    src: upath.join(srcRoot, 'scripts/**/*.ts'),
    dest: upath.join(basePath, 'js'),
    buildOptions: {
        minifyOnly: true,
        // printConfig: true,
        tsConfig: upath.join(srcRoot, 'scripts/tsconfig.json'),
        sourceMap: sourceMap,
    },
    postBuild: (rtb) => {
        rtb.copy({ src: [upath.join(srcRoot, "scripts/**/*.js")], dest: upath.join(basePath, 'js') });
        rtb.exec(`echo > ${jekyllTrigger}`);
    },
    addWatch: [upath.join(srcRoot, "scripts/**/*.js")],
    clean: [upath.join(basePath, 'js')],
    flushStream: true,
}

const jekyll = {
    name: 'jekyll',
    builder: {
        command: `jekyll build -s ${basePath} -d ${destRoot}${baseUrl}`,
        args: [
            '--safe',   // github runs in safe mode for security reason. Custom plugins are not supported.
            '--incremental',
        ]
    },
    watch: [
        jekyllTrigger,
        upath.join(basePath, '**/*.{yml,html,md}'),
        `!(${upath.join(basePath, '{_site,_site/**/*}')})`,
        `!(${upath.join(basePath, '{js,js/**/*}')})`,
        `!(${upath.join(basePath, '{css,css/**/*}')})`,
        `!(${upath.join(basePath, 'gulpfile.js')})`,
    ],
    clean: [destRoot, upath.join(basePath, '.jekyll-metadata'), jekyllTrigger]
}

const build = {
    name: '@build',
    dependencies: tron.series(tron.parallel(scss, scripts), jekyll)
};

const serve = {
    name: 'serve',
    builder: {
        command: `jekyll serve -s ${basePath} -d ${destRoot}${baseUrl} --safe --incremental`,
    }
}


module.exports = tron.createProject({build, serve}, {prefix})
    .addWatcher({
        browserSync: {
            server: upath.resolve(destRoot),
            port: port,
            ui: { port: port + 1 },
            startPath: baseUrl,
            // open: true,
            // reloadDebounce: 3000
        }
    })
    .addCleaner()
