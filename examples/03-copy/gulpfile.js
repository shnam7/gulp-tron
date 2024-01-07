const tron = require('gulp-tron');
const upath = require('upath');

const basePath = upath.relative(process.cwd(), __dirname);
const projectName = upath.basename(__dirname);
const prefix = projectName + ':';

const copy1 = {
    name: 'copy1',
    builder: (rtb) => rtb.copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest1') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest2') }
        ], { verbose: true }),
    flushStream: true, // task to finish after all the files copies are finished
}

const copy2 = {
    name: 'copy2',
    builder: (rtb) => rtb
        .copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4') },
        ], {verbose: true}),
    preBuild: (rtb) => rtb
        .copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3-pre') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4-pre') },
        ], {verbose: true}),

    postBuild: (rtb) => rtb
        .copy([
            { src: [upath.join(basePath, 'path-src1/**/*.*')], dest: upath.join(basePath, 'path-dest3-post') },
            { src: [upath.join(basePath, 'path-src2/**/*.*')], dest: upath.join(basePath, 'path-dest4-post') },
        ], {verbose: true}),

    sync: true,
    verbose: true
}

const build = {
    name: '@build',
    triggers: tron.parallel(copy1, copy2),
    clean: [upath.join(basePath, 'path-dest*')]
}

tron.createProject(build, {prefix}).addCleaner();
