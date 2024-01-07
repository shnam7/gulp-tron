const tron = require('gulp-tron');
const upath = require('upath');

const basePath = upath.relative(process.cwd(), __dirname);
const srcRoot = upath.join(basePath, 'assets');
const destRoot = upath.join(basePath, 'www');

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';
const port = 5000;

const destZip = upath.join(basePath, '_dist');


const concat = {
    name: 'concat',
    builder: 'GConcatBuilder',
    src: [upath.join(basePath, 'concat/*.js')],
    order: ['file2.js', '*.js'],
    dest: upath.join(destRoot, 'js'),
    outFile: 'concated.js',
    clean: upath.join(destRoot, 'js')
};

const scss = {
    name: 'scss',
    builder: 'GCSSBuilder',
    src: upath.join(srcRoot, 'scss/**/*.scss'),
    dest: upath.join(destRoot, 'css'),
    clean: upath.join(destRoot, 'css'),
}

const images = {
    name: 'images',
    builder: 'GImagesBuilder',
    src: upath.join(srcRoot, 'images/**/*'),
    dest: upath.join(destRoot, 'img'),
    clean: [upath.join(destRoot, 'img'),]
}

const zip = {
    name: 'zip',
    builder: 'GZipBuilder',
    src: [
        upath.join(destRoot, '**/*'),
        upath.join(srcRoot, 'zip-me-too/**/*')
    ],
    dest: destZip,
    outFile: '10-www.zip',
    watch: [],   // disable watch by setting 'watch' to empty array
    clean: destZip
}

const build = {
    name: '@build',
    dependencies: tron.series(tron.parallel(concat, scss, images), zip)
}

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
