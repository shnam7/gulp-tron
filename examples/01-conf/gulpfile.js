import path from 'node:path'
import {fileURLToPath} from 'node:url'
import tron from 'gulp-tron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const __filename = path.basename(__dirname)

const commonBuildOptions = {
    sourcemaps: true,
    // group: projectName,
    // prefix: true,
}

// --- standard TaskConfig form
const b1 = {name: 'b1', build: bs => console.log(`${bs.name} executed.`)}
tron.task(b1)

// --- no build function: internal null function is assigned to b2 and task is created.
const b2 = {name: 'b2'}
tron.task(b1)

// --- b3 is effectively an alias for b1, b4 is alias for b2
const b3 = {name: 'b3', dependsOn: b1}
const b4 = {name: 'b4', triggers: b2}
const b5 = {name: 'b5', dependsOn: b1, triggers: b2}
tron.createTasks(b3, b4, b5)

// --- g0 has group prefix
const g0 = {name: 'g0', dependsOn: b1, triggers: b2, ...commonBuildOptions}
tron.createTasks(g0)

// --- task group with task options. check the gulp tree shape with "pnpm gulp --tasks" command
const g1 = {name: 'g1', build: bs => console.log(`${bs.name} executed.`), dependsOn: g0}
const g2 = {
    name: 'g2',
    build: bs => console.log(`${bs.name} executed.`),
    dependsOn: tron.parallel(b1),
}
const g3 = {
    name: 'g3',
    build: bs => console.log(`${bs.name} executed.`),
    dependsOn: tron.parallel(b1, b2),
}
tron.createTasks(g1, g2, g3, commonBuildOptions)

// --- using task options
tron.task('b6', bs => console.log(`${bs.name}:className=${bs.className}`))
tron.task('g4', bs => console.log(`${bs.name}:className=${bs.className}`), commonBuildOptions)
tron.task('g5', bs => console.log(`${bs.name}:className=${bs.className}`), {
    dependsOn: b1,
    ...commonBuildOptions,
})

tron.task({
    name: '@build',
    dependsOn: tron.series(b1, tron.parallel(b2, b3, b4), b5, 'g5'),
    triggers: tron.series(b1, tron.parallel(b2, b3, b4), b5, 'g5'),
})
