import path from 'node:path'
import {fileURLToPath} from 'node:url'
import process from 'node:process'
import tron from 'gulp-tron'
import markdownG from 'gulp-markdown'
import htmlCleanG from 'gulp-htmlclean'
import prettierG from 'gulp-prettier'
import {sassP} from '@gulp-tron/plugin-styles'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

// --- common
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'dist')
const portBase = 5000

const markdown = {
    name: 'markdown',
    build(bs) {
        bs.src() //
            .pipe(markdownG())
            .pipe(htmlCleanG())
            .pipe(prettierG())
            .dest()
    },

    src: [path.join(srcRoot, '**/*.md')],
    dest: destRoot,
}

const scss = {
    name: 'scss',
    build: bs => bs.src().chain(sassP()).dest(),

    src: [path.join(srcRoot, '**/*.scss')],
    dest: destRoot,
}

const build = {
    name: '@build',
    triggers: tron.parallel(markdown, scss),
    clean: [destRoot],
}

tron.task(build)
    .addCleaner()
    .addWatcher({
        // watch: [path.join(destRoot, '**/*.html')],
        browserSync: {
            server: destRoot,
            port: portBase + Number.parseInt(prefix, 10),
            ui: {port: portBase + 100 + Number.parseInt(prefix, 10)},
        },
    })
