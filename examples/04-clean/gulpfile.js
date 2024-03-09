import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, '_build')

console.log('======cwd:', process.cwd())

const copier = {
    name: 'copier',
    build: async bs => {
        bs.copy({ src: [path.join(destRoot, 'do-not-delete/sample.txt')], dest: destRoot }).then(() => {
            try {
                fs.accessSync(bs.opts.clean[0])
            } catch (err) {
                bs.log(`==>Error:file copy failed`)
                throw err
            }
        })
    },
    clean: [path.join(destRoot, 'sample.txt')],
}

const dummyCleaner = {
    name: 'dummyCleaner',
    build: bs => bs.clean('dir/**/files-to-delete*.*'), // extra clean targets in addition to build config clean target

    // clean target for this build config
    clean: [
        path.join(srcRoot, 'build2/**/dummy.txt'),
        path.join(destRoot, '**/*'),

        // exclude from clean
        `!${path.join(destRoot, '{do-not-delete,do-not-delete/**/*}')}`,
    ],
}

const build = {
    name: '@build',
    triggers: tron.parallel(copier, dummyCleaner),
}

tron.createTask(build).addCleaner()
