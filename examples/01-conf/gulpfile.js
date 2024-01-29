import tron from 'gulp-tron'
import upath from 'path'
import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

const taskOptions = {
    group: projectName,
    prefix: true,
}

// standard TaskConfig form
const b1 = { name: 'b1', build: bs => console.log(`${bs.name} executed.`) }

// internal null function is assigned to b2 and task is created.
const b2 = { name: 'b2' }

// b3 is effectively an alias for b1, b4 is alias for b2
const b3 = { name: 'b3', dependsOn: b1 }
const b4 = { name: 'b4', triggers: b2 }
const b5 = { name: 'b5', dependsOn: b1, triggers: b2 }

// g0 has group prefix
const g0 = { name: 'g0', dependsOn: b1, triggers: b2, ...taskOptions }

tron.createTasks(b1, b2, b3, b4, b5, g0)

//--- task grouping. check the gulp tree shape with "npx gulp --tasks" command
const g1 = { name: 'g1', build: bs => console.log(`${bs.name} executed.`), dependsOn: g0 }
const g2 = { name: 'g2', build: bs => console.log(`${bs.name} executed.`), dependsOn: tron.parallel(b1) }
const g3 = { name: 'g3', build: bs => console.log(`${bs.name} executed.`), dependsOn: tron.parallel(b1, b2) }

tron.createTasks(g1, g2, g3, taskOptions)

tron.task('b6', bs => console.log(`${bs.name}: className=${bs.className}`))
tron.task('g5', bs => console.log(`${bs.name}: className=${bs.className}`), taskOptions)
tron.task('g6', bs => console.log(`${bs.name}: className=${bs.className}`), { dependsOn: b1, ...taskOptions })

tron.task({
    name: '@build',
    dependsOn: tron.series(b1, tron.parallel(b2, b3, b4), b5, tron.taskName('g6')),
    triggers: tron.series(b1, tron.parallel(b2, b3, b4), b5, tron.taskName('g6')),
})

// console.log(`---1.0:`, tron.findTask('g1').name)
// console.log(`---1.1:`, tron.findTask('01-conf:g1').name)
// console.log(
//     tron.taskConfigs.map(conf => conf.name),
//     // tron.filterTasks(tron.taskConfigs, [/build[15]/, 'build8']).map(conf => conf.name),
//     // tron.selectTasks([/build[15]/, 'build8']).map(conf => conf.name),
//     // tron.selectTasksByGroup().map(conf => conf.name),
// )

// gulp.task('t1', cb => cb())
// gulp.task('t2', cb => cb())
// gulp.task('t3', gulp.series(gulp.task('t1')))

// const t1 = gulp.task('t1')
// const t2 = gulp.task('t2')
// const t3 = gulp.task('t3')

// const s1 = gulp.series(t1, t2)
// const s2 = gulp.parallel(t1, t2)

// console.log('---2:t1=', t1)
// console.log('---2:t2=', t2)
// console.log('---2:s1=', s1)
// console.log('---2:s1=', s1)
// console.log('---2:t3=', t3)
// console.log('---3', t1.toString(), t2.toString(), t3.toString(), s1.toString(), s2.toString(), '---')
