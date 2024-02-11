import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

//--- common
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'dist')
const portBase = 5000

//--- markdown
import markdownG from 'gulp-markdown'
import htmlCleanG from 'gulp-htmlclean'
import prettierG from 'gulp-prettier'

const markdown = {
    name: 'markdown',
    build: bs => {
        bs.src() //
            .pipe(markdownG())
            .pipe(htmlCleanG())
            .pipe(prettierG())
            .dest()
    },

    src: [path.join(srcRoot, '**/*.md')],
    dest: destRoot,
}

//--- sass
import { sassP } from '@gulp-tron/plugin-styles'
const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sassP()).dest(),

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
            port: portBase + parseInt(prefix),
            ui: { port: portBase + 100 + parseInt(prefix) },
        },
    })
