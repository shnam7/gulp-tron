import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'
import paniniG from 'panini'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- project settings
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName
const srcRoot = path.join(basePath, 'assets/panini')
const destRoot = path.join(basePath, 'dist')
const portBase = 5000

const paniniOptions = {
    root: path.join(srcRoot, 'pages/'),
    layouts: path.join(srcRoot, 'layouts/'),
    partials: path.join(srcRoot, 'partials/'),
    data: path.join(srcRoot, 'data/'),
    helpers: path.join(srcRoot, 'helpers/'),
}

const panini = {
    name: 'panini',
    build(bs) {
        paniniG.refresh()
        bs.src().pipe(paniniG(paniniOptions)).rename({extname: '.html'}).dest()
    },

    // panini does not handle backslashes correctly, so replace them to slash
    src: [path.join(srcRoot, 'pages/**/*')],
    dest: path.join(destRoot, ''),
    // include sub directories to detect changes of the file which are not in src list.
    watch: [path.join(srcRoot, '**/*')],
    clean: [destRoot],
}

const build = {name: '@build', triggers: panini}

tron.task(build)
    .addCleaner()
    .addWatcher({
        browserSync: {
            server: path.resolve(destRoot),
            port: portBase + Number.parseInt(prefix, 10),
            ui: {port: portBase + 100 + Number.parseInt(prefix, 10)},
        },
    })
