import tron from 'gulp-tron'
import upath from 'upath'
import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

const copy1 = {
    name: 'copy1',
    builder: builder =>
        builder.copy(
            [
                { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest1') },
                { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest2') },
            ],
            { verbose: true },
        ),
}

const copy2 = {
    name: 'copy2',
    builder: builder =>
        builder.copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4') },
        ]),
    preBuild: builder =>
        builder.copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3-pre') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4-pre') },
        ]),

    postBuild: builder =>
        builder.copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3-post') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4-post') },
        ]),
    verbose: true,
}

const build = {
    name: '@build',
    triggers: tron.parallel(copy1, copy2),
    clean: [upath.join(basePath, 'path-dest*')],
}

tron.createProject(build, { prefix }).addCleaner()
