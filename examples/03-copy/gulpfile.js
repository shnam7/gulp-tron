import tron from 'gulp-tron'
import upath from 'upath'
import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

const outDir = basePath + '__outdir'

const copyOptions = { logLevel: 'verbose' }

const copy1 = {
    name: 'copy1',
    dependsOn: (bs, opts) =>
        bs.copy(
            [
                { src: [upath.join(outDir, 'path-src1/**/*.*')], dest: upath.join(outDir, 'path-dest1') },
                { src: [upath.join(outDir, 'path-src2/**/*.*')], dest: upath.join(outDir, 'path-dest2') },
            ],
            copyOptions,
        ),
    logLevel: 'verbose',
}

const copy2 = {
    name: 'copy2',
    build: (bs, opts) =>
        bs.copy([
            { src: [upath.join(outDir, 'path-src1/**/*.*')], dest: upath.join(outDir, 'path-dest3') },
            { src: [upath.join(outDir, 'path-src2/**/*.*')], dest: upath.join(outDir, 'path-dest4') },
        ]),
    dependsOn: (bs, opts) =>
        bs.copy(
            [
                { src: [upath.join(outDir, 'path-src1/**/*.*')], dest: upath.join(outDir, 'path-dest3-pre') },
                { src: [upath.join(outDir, 'path-src2/**/*.*')], dest: upath.join(outDir, 'path-dest4-pre') },
            ],
            copyOptions,
        ),
    triggers: (bs, opts) =>
        bs.copy(
            [
                { src: [upath.join(outDir, 'path-src1/**/*.*')], dest: upath.join(outDir, 'path-dest3-post') },
                { src: [upath.join(outDir, 'path-src2/**/*.*')], dest: upath.join(outDir, 'path-dest4-post') },
            ],
            copyOptions,
        ),
    logLevel: 'verbose',
}

const build = {
    name: '@build',
    triggers: tron.parallel(copy1, copy2),
    clean: [upath.outDir],
}
tron.task(build)

tron.task({
    name: '@clean',
    build: bs => {
        bs.del(outDir)
    },
})

// tron.createProject(build, {
//     prefix,
// }).addCleaner()
