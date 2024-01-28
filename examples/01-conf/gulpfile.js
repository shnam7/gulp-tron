import tron from 'gulp-tron'
import upath from 'upath'
import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

const groupOptions = {
    group: projectName,
    groupPrefix: true,
}
const taskNameOf = name => groupOptions.group + ':' + name

const build1 = {
    name: 'build1',
    build: bs => console.log(`${bs.name} executed.`),
    ...groupOptions,
}

const build2 = {
    ...groupOptions,
    name: 'build2',
    build: bs => console.log(`${bs.name}:main executed.`),
    dependsOn: build1,
    ...groupOptions,
}

const build3 = {
    name: 'build3',
    build: bs => console.log(`${bs.name}:main executed.`),
    dependsOn: tron.parallel(build1, build2),
    ...groupOptions,
}

const build4 = {
    name: 'build4',
    ...groupOptions,
}

const build5 = {
    name: 'build5',
    // Having tron.task() on dependencies is not recommended way, even though it's working correctly.
    dependsOn: tron.task('build6', bs => console.log(`${bs.name} executed.`), groupOptions),
    ...groupOptions,
}

tron.createTasks(build1) // test for single item
tron.createTasks(build2, build3, build4, build5) // test for multiple items

tron.task('build7', bs => console.log(`${bs.name}: className=${bs.className}`), groupOptions)

tron.task('build8', bs => console.log(`${bs.name}: className=${bs.className}`), { dependsOn: build1, ...groupOptions })

tron.task({
    name: '@build',
    dependsOn: tron.series(build1, tron.parallel(build2, build3, build4), build5, taskNameOf('build6'), taskNameOf('build7'), taskNameOf('build8')),
    triggers: tron.series(build1, tron.parallel(build2, build3, build4), build5, taskNameOf('build6'), taskNameOf('build7'), taskNameOf('build8')),
    ...groupOptions,
})

console.log(
    tron.taskConfigs.map(conf => conf.name),
    build5.dependsOn.unwrap().toString(),
)
