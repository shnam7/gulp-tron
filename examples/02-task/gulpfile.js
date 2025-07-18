// Import path from 'node:path';
// import {fileURLToPath} from 'node:url';
import tron from '@gulp-tron/core'
import gulp from 'gulp'

// Const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Const projectName = path.basename(__dirname)
// const prefix = projectName + ':'
// const basePath = path.relative(process.cwd(), __dirname)

// --- build item type #1: BuildConfig items
const build1 = {name: 'build1'}
const build2 = {name: 'build2', build: bs => console.log(`${bs.name} executed`)}

// --- build item type #2: native gulp task function
function buildFunc(bs) {
    console.log(`gulpTaskFunc(${bs.name}): Hello, Tron!`)
}

// --- build item type #3: existing gulp task
gulp.task('nativeGulpTask', done => done()) // This task will be created first

// --- buildset: combination of single item, series, parallel
const set01 = [build1]
const set02 = [build1, build2, buildFunc, 'nativeGulpTask'] // Series
const set03 = tron.parallel(build1, build2)
const set04 = tron.series(build1, build2)
const set05 = [build1, build2] // Serial set, the same as set04
const set06 = 'build1'

const build3 = {
    name: 'build3',
    dependsOn: bs => console.log(`${bs.name}:annonymous: dependsOn successful.`),
    triggers: bs => console.log(`${bs.name}:annonymous: trigger successful.`),
}

const simpleTask = {
    name: 'simpleTask',
    build: bs => console.log(`${bs.name} executed`),

    triggers: bs => console.log(`${bs.name}:annonymous: trigger successful.`),
    customVar1: 'customer variable#1',
    customVar2: 'customer variable#2',
}

// --- external commands
const cmd1 = {
    name: 'cmd1',
    build(bs) {
        bs.exec('ls -1 .')
    },
}

const cmd2 = {
    name: 'cmd2',
    build(bs) {
        bs.exec('node -v')
    },
}

const main = {
    name: '@build',
    build: builder => console.log(builder.name + ' is running'),
    dependsOn: tron.parallel(set01, set02, set03, set04, set05, set06),
    triggers: [cmd1, cmd2], // Run in series
}

tron.createTasks(build1, build2, build3, simpleTask, cmd1, cmd2, main)
