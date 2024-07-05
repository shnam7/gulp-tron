import tron from 'gulp-tron'
// import path from 'path'
// import { fileURLToPath } from 'url'
// const __dirname = path.dirname(fileURLToPath(import.meta.url))

// const basePath = path.relative(process.cwd(), __dirname)
// const projectName = path.basename(__dirname)
// const prefix = projectName + ':'
// const outDir = basePath + '__outdir'

const createTestFiles = {
    name: 'createTestFiles',
    build: bs =>
        bs.exec(`mkdir -p test-src; touch test-src/test.js test-src/test.css test-src/test.html`),
}
tron.task(createTestFiles)

const testSingleCopy = {
    name: 'testSingleCopy',
    build: bs => bs.copy('test-src/**/*.html', 'test-dest'),
    // build: bs => bs.src().debug('before copy:').copy('test-src/**/*.html', 'test-dest').debug('after copy:'),

    // src: 'test-src/**/*.js',
    logLevel: 'verbose',
}
tron.task(testSingleCopy)

const testMultiCopy = {
    name: 'testMultiCopy',
    build: bs =>
        bs.copy([
            {src: ['test-src/**/*.js'], dest: 'test-dest/js'},
            {src: ['test-src/**/*.css'], dest: 'test-dest/css'},
        ]),
}
tron.task(testMultiCopy)

// const pushpop = {
//     name: 'pushpop',
//     build: bs => {
//         bs.src('./test-src/**/*').debug({ title: 'before push' }).pushStream().debug({ title: 'after push' }).popStream().debug({ title: 'after pop' })
//     },
// }
// tron.task(pushpop)

const build = {
    name: '@build',
    triggers: tron.series(createTestFiles, testSingleCopy, testMultiCopy),
    clean: ['test-src', 'test-dest'],
}

tron.task(build).addCleaner()
