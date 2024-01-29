import tron from 'gulp-tron'
import path from 'path'
import gulp from 'gulp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = path.relative(process.cwd(), __dirname)
const projectName = path.basename(__dirname)
const prefix = projectName + ':'

//--- build item type #1: BuildConfig items
const build1 = { name: 'build1' }
const build2 = { name: 'build2', build: bs => console.log(`${bs.name} executed`) }

//--- build item type #2: native gulp task function
function buildFunc(bs) {
    console.log('gulpTaskFunc: Hello, Lake!')
}

//--- build item type #3: existing gulp task
gulp.task(prefix + 'nativeGulpTask', done => done()) // this task will be created first

//--- buildset: combination of single item, series, parallel
const set01 = [build1]
const set02 = [build1, build2, buildFunc, prefix + 'nativeGulpTask'] // series
const set03 = tron.parallel(build1, build2)
const set04 = tron.series(build1, build2)
const set05 = [build1, build2] // serial set, the same as set04
const set06 = 'build1'

const build3 = {
    name: 'build3',
    dependsOn: bs => console.log(`build3:annonymous: dependsOn successful.`),
    triggers: bs => console.log(`build3:annonymous: trigger successful.`),
}

const simpleTask = {
    name: 'simpleTask',
    build: bs => console.log(`${bs.name} executed`),

    triggers: bs => console.log(`simpleTask:annonymous: trigger successful.`),
    customVar1: 'customer variable#1',
    customVar2: 'customer variable#2',
}

//--- external commands
const cmd1 = {
    name: 'cmd1',
    build: bs => {
        bs.exec(`ls -1 .`)
    },
    dependsOn: undefined,
}

const cmd2 = {
    name: 'cmd2',
    build: bs => {
        bs.exec(`node - v`)
    },
}

const main = {
    name: '@build',
    build: builder => console.log(builder.name + ' is running'),
    dependsOn: tron.parallel(set01, set02, set03, set04, set05, set06),
    triggers: [cmd1, cmd2], // run in series
}

tron.createTasks(build1, build2, build3, simpleTask, cmd1, cmd2, main)
