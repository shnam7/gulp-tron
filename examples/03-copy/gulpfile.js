import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const outDir = basePath + '__outdir'

const copyOptions = { logLevel: 'verbose' }

const copy1 = {
    name: 'copy1',
    dependsOn: bs =>
        bs.copy(
            [
                { src: [path.join(outDir, 'path-src1/**/*.*')], dest: path.join(outDir, 'path-dest1') },
                { src: [path.join(outDir, 'path-src2/**/*.*')], dest: path.join(outDir, 'path-dest2') },
            ],
            copyOptions,
        ),
    logLevel: 'verbose',
}

const copy2 = {
    name: 'copy2',
    build: bs =>
        bs.copy([
            { src: [path.join(outDir, 'path-src1/**/*.*')], dest: path.join(outDir, 'path-dest3') },
            { src: [path.join(outDir, 'path-src2/**/*.*')], dest: path.join(outDir, 'path-dest4') },
        ]),
    dependsOn: (bs, opts) =>
        bs.copy(
            [
                { src: [path.join(outDir, 'path-src1/**/*.*')], dest: path.join(outDir, 'path-dest3-pre') },
                { src: [path.join(outDir, 'path-src2/**/*.*')], dest: path.join(outDir, 'path-dest4-pre') },
            ],
            copyOptions,
        ),
    triggers: (bs, opts) =>
        bs.copy(
            [
                { src: [path.join(outDir, 'path-src1/**/*.*')], dest: path.join(outDir, 'path-dest3-post') },
                { src: [path.join(outDir, 'path-src2/**/*.*')], dest: path.join(outDir, 'path-dest4-post') },
            ],
            copyOptions,
        ),
    logLevel: 'verbose',
}

const build = {
    name: '@build',
    triggers: tron.parallel(copy1, copy2),
    clean: [outDir],
}

tron.task(build).addCleaner()
