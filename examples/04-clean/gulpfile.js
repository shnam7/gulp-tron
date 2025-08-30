import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import fs from 'node:fs'
import tron from 'gulp-tron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Const projectName = path.basename(__dirname)
// const prefix = projectName + ':'
const basePath = path.relative(process.cwd(), __dirname)
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'dist')

const copier = {
    name: 'copier',
    async build(bs) {
        bs.copy({src: [path.join(destRoot, 'do-not-delete/sample.txt')], dest: destRoot})

        try {
            fs.accessSync(bs.opts.clean[0])
        } catch (error) {
            bs.log('==> Error:file copy failed')
            throw error
        }
    },
    clean: [path.join(destRoot, 'sample.txt')],
    logLevel: 'verbose',
}

const dummyCleaner = {
    name: 'dummyCleaner',
    build: bs => bs.clean('dir/**/files-to-delete*.*'), // Extra clean targets in addition to build config clean target

    // clean target for this build config
    clean: [
        path.join(srcRoot, 'build2/**/dummy.txt'),
        path.join(destRoot, '**/*'),

        // Exclude from clean
        `!${path.join(destRoot, '{do-not-delete,do-not-delete/**/*}')}`,
    ],
}

const build = {
    name: '@build',
    triggers: tron.parallel(copier, dummyCleaner),
}

tron.task(build).addCleaner()
