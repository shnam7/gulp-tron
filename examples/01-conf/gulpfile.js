import tron from 'gulp-tron'
import upath from 'upath'
import gulp from 'gulp'
import {
    fileURLToPath
} from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'


const build1 = {
    name: 'build1',
    build: bs => console.log(`${bs.name} executed.`),
}

const build2 = {
    name: 'build2',
    build: bs => console.log(`${bs.name}:main executed.`),
    dependsOn: build1
}

const build3 = {
    name: 'build3',
    build: bs => console.log(`${bs.name}:main executed.`),
    dependsOn: tron.parallel(build1, build2)
}

const build4 = {
    name: 'build4'
}

tron.task('build5', (bs) => {
    console.log(`${bs.name}: className=${bs.className}`)
})

tron.task({
    name: '@build',
    dependsOn: tron.series(build1, tron.parallel(build2, build3, build4), 'build5'),
    triggers: tron.series(build1, tron.parallel(build2, build3, build4), 'build5'),
})
