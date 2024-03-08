import tron from 'gulp-tron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

const outDir = basePath + '__outdir'

const createTestFiles = {
    name: 'createTestFiles',
    build: bs => bs.exec(`mkdir -p test-src; touch test-src/test.js test-src/test.css test-src/test.html`),
}
tron.task(createTestFiles)

const testSingleCopy = {
    name: 'testSingleCopy',
    build: bs => bs.copy('test-src/**/*.html', 'test-dest'),
}
tron.task(testSingleCopy)

const testMultiCopy = {
    name: 'testMultiCopy',
    build: bs =>
        bs.copy([
            { src: ['test-src/**/*.js'], dest: 'test-dest/js' },
            { src: ['test-src/**/*.css'], dest: 'test-dest/css' },
        ]),
}
tron.task(testMultiCopy)

const build = {
    name: '@build',
    triggers: tron.series(createTestFiles, testSingleCopy, testMultiCopy),
    clean: ['test-src', 'test-dest'],
}

tron.task(build).addCleaner()
