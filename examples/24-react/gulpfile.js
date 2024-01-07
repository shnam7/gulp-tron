const tron = require('gulp-tron');
const upath = require('upath');

const basePath = upath.relative(process.cwd(), __dirname);
const srcRoot = upath.join(basePath, 'assets');
const destRoot = upath.join(basePath, 'www');

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';
const port = 5000;

const scss = {
    name: 'scss',
    builder: 'GCSSBuilder',
    src: upath.join(srcRoot, 'scss/**/*.scss'),
    dest: upath.join(destRoot, 'css'),
    clean: upath.join(destRoot, 'css')
}

const scripts = {
    name: 'scripts',
    builder: 'GTypeScriptBuilder',
    src: upath.join(srcRoot, 'scripts/**/*.ts*'),
    dest: upath.join(destRoot, 'js'),
    buildOptions: {
        tsConfig: upath.join(basePath, 'tsconfig.json')
    },
    addWatch: upath.join(basePath, 'tsconfig.json'),
    clean: upath.join(destRoot, 'js'),
    npmInstall: ['react', 'react-dom', '@types/react', '@types/react-dom']
}

const build = { name: '@build', triggers: tron.parallel(scss, scripts) }

tron.createProject(build, { prefix })
    .addWatcher({
        watch: [upath.join(destRoot, '**/*.html')],  // watch files for reloader (no build actions)
        browserSync: {
            server: destRoot,
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) }
        },
    })
    .addCleaner();
