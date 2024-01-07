'use strict';

const tron = require('gulp-tron');
const upath = require('upath');

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';

const basePath = upath.relative(process.cwd(), __dirname);
const srcRoot = upath.join(basePath, 'assets');
const destRoot = upath.join(basePath, '_build');
const port = 5000;

const markdown = {
    name: 'markdown',
    builder: 'GMarkdownBuilder',
    src: [upath.join(srcRoot, '**/*.md')],
    dest: destRoot,
    buildOptions: { prettify: true }
};

const scss = {
    name: 'scss',
    builder: 'GCSSBuilder',
    src: [upath.join(srcRoot, '**/*.scss')],
    dest: destRoot,
    clean: [destRoot]
};

const build = {
    name: '@build',
    triggers: tron.parallel(markdown, scss),
    clean: [destRoot]
}


tron.createProject(build, { prefix })
    .addWatcher({
        browserSync: {
            server: destRoot,
            port: port + parseInt(prefix),
            ui: { port: port + 100 + parseInt(prefix) }
        }
    })
    .addCleaner();
