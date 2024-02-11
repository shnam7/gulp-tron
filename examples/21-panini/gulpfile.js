import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName

const srcRoot = path.join(basePath, 'assets/panini')
const destRoot = path.join(basePath, 'dist')
const portBase = 5000

//--- panini
import paniniP from 'panini'
const paniniOptions = {
    root: path.join(srcRoot, 'pages/'),
    layouts: path.join(srcRoot, 'layouts/'),
    partials: path.join(srcRoot, 'partials/'),
    data: path.join(srcRoot, 'data/'),
    helpers: path.join(srcRoot, 'helpers/'),
}

const panini = {
    name: 'panini',
    build: bs => {
        paniniP.refresh()
        bs.src().pipe(paniniP(paniniOptions)).rename({ extname: '.html' }).dest()
    },

    // panini does not handle backslashes correctly, so replace them to slash
    src: [path.join(srcRoot, 'pages/**/*')],
    dest: path.join(destRoot, ''),
    // include sub directories to detect changes of the file which are not in src list.
    watch: [path.join(srcRoot, '**/*')],
    clean: [destRoot],
}

const build = { name: '@build', triggers: panini }

tron.task(build)
    .addCleaner()
    .addWatcher({
        browserSync: {
            server: path.resolve(destRoot),
            port: portBase + parseInt(prefix),
            ui: { port: portBase + 100 + parseInt(prefix) },
        },
    })
