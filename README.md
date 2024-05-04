# gulp-tron
Easy to use, configuration based gulp build manager. Users can create gulp tasks with simple configuration. At the same time, users can defien build function as part of the configuration leveraging BuildStream API.

It provides major two benefits:
- Easy to building task dependency hierarchy.
- Easy to define build process leveraging BuildStream API.

Focus on build actions, rather than environment setup.


## Installation
```bash
npm i --save-dev gulp gulp-tron

# or
yard add -D gulp gulp-tron

# or
pnpm add -D gulp gulp-tron
```

gulp is required as peer dependency, to run gulp tron.


## Key features
- Quick and easy gulp task creation using configuration.
- Rich BuildStream API to help define build process.
- Easy to add clean and watch tasks with minimal efforts
- Browser-sync support in the build configuration.
- Plugin support to develop and share build actions.
- Tested with gulp 5 and streamx.


## Quick example: gulpfile.js

```js
import tron from 'gulp-tron'
import path from 'path'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import babel from 'gulp-babel'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

//--- project settings
const basePath = path.relative(process.cwd(), __dirname)
const srcRoot = path.join(basePath, 'assets')
const destRoot = path.join(basePath, 'www')
const sass = gulpSass(dartSass)

//--- scss build configuration
const scss = {
    name: 'scss',
    build: bs => bs.src().pipe(sass().on('error', sass.logError)).dest(),

    src: path.join(srcRoot, 'scss/**/*.scss'),
    dest: path.join(destRoot, 'css'),
}

//--- scripts build configuration
const scripts = {
    name: 'scripts',
    build: bs => bs.src().pipe(babel()).dest(),

    src: path.join(srcRoot, 'js/**/*.js'),
    dest: path.join(destRoot, 'js'),
}

//--- main build configuration
const build = {
    name: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: path.join(destRoot, '{css,js}'),
}

// now create build task. Then it also creates dependent tasks recurrsively.
tron.task(build)
    .addCleaner()
    .addWatcher({
        watch: path.join(destRoot, '**/*.html'),
        browserSync: { server: destRoot },
    })
```

Now you can see the gulp tasks created from this with `gulp --tasks` command:

```bash
$ pnpm gulp --tasks
Tasks for ~/dev/public/gulp-tron/examples/00-getting-started/gulpfile.js
├── scss
├── scripts
├─┬ @build
│ └─┬ <parallel>
│   ├── scss:main
│   └── scripts:main
├── @clean
└── @watch
```

- `scss` and `scripts` tasks were created.
- `@build` task has two parallel tasks: `scss:main` and `script:main`
- `@clean` and `@watch` tasks were also created.
- `bs` is an instance of `BuildStream` automatically created by the task.
- `scss:main` and `script:main` are display names referring to `scss` and `scripts` tasks.

Check **[examples](./examples/)** for more examples.


<br/><br/>
<p align="center">
  <img class="logo" src="gulp-tron.svg" width="64px">
  <p align=center>Copyright &copy; 2024, under <a href="./LICENSE">MIT</a></p>
</div>
