import tron from 'gulp-tron'
import upath from 'upath'
import { fileURLToPath } from 'url'

const __dirname = upath.dirname(fileURLToPath(import.meta.url))
const basePath = upath.relative(process.cwd(), __dirname)
const projectName = upath.basename(__dirname)
const prefix = projectName + ':'

// Create BuildConf Item #1
const build1 = {
    name: 'build1',
    builder: builder => console.log(builder.name + ' executed.'),
    preBuild: builder => console.log(builder.name + ' preBuild called.'),
    postBuild: builder => console.log(builder.name + ' postBuild called.'),
}

// Create BuildConf Item #2
const build2 = {
    name: 'build2',
    builder: builder => console.log(builder.name + ' executed.'),
    preBuild: builder => console.log(builder.name + ' preBuild called.'),
    postBuild: builder => console.log(builder.name + ' postBuild called.'),
}

// Create BuildConf for main
const main = {
    name: '@build',
    builder: builder => console.log(builder.name + ' executed.'),
    preBuild: builder => console.log(builder.name + ' preBuild called.'),
    postBuild: builder => console.log(builder.name + ' postBuild called.'),

    dependencies: tron.parallel(build1, build2),
    triggers: tron.series(build1, build2),
}

tron.createProject({ main }, {})
