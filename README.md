# gulp-tron
Easy to use, configuration based gulp build manager. Users can create gulp tasks with simple build configurations. At the same time, javascript can be used to customize and extend the configuration.

Focus on build actions, rather than environment setup.

## Installation
```bash
npm i gulp-tron --save-dev
npm i gulp --save-dev
```
gulp should also be installed.


## Documentation
Go to [Documentation](https://shnam7.github.io/gulp-tron)


## Key features
- Quick and easy gulp task creation
- Watching, reloading, and cleaning with minimal efforts
- Rich run-time builder API for user build actions
- Sync and async control for tasks, build actions, and gulp streams for flushing.
- Automatic Node module installation (npm/pnpm/yarn)
- Small to large scale project support using modular configuration
- Pre-defined Buildt-in builders and extensions
- Custom builders and extension support


## Quick example: gulpfile.js

```js
const tron = require('gulp-tron');

const scss = {
    buildName: 'scss',
    builder: (rtb) => {
        const sass = require('gulp-sass');
        rtb.src().pipe(sass().on('error', sass.logError)).dest()
    },
    src: 'assets/scss/**/*.scss',
    dest: 'www/css',
    npmInstall: ['gulp-sass']
}

const scripts = {
    buildName: 'babel',
    builder: (rtb) => {
        const babel = require('gulp-babel');
        rtb.src().pipe(babel()).dest()
    },
    src: 'assets/js/**/*.js',
    dest: 'www/js',
    npmInstall: ['gulp-babel', '@babel/core']
}

const build = {
    buildName: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: 'www/{css,js}'
}

tron.createProject(build)
    .addWatcher({
        watch: 'www/**/*.html',
        browserSync: { server: 'www' }
    })
    .addCleaner();
```

This gulpfile will create a single project with 5 gulp tasks as following:
- scss: sass transpiler
- babel: ES6 transpiler using babel
- @build: main task running 'scss' and 'babel' in parallel
- @clean: clean task (default name is @clean)
- @watch: Full featured watch task with reloading using browser-sync (default name is @watch)


## Easier way using built-in builders: gulpfile.js
```js
const tron = require('gulp-tron');

const scss = {
    buildName: 'scss',
    builder: 'GCSSBuilder',
    src: 'assets/scss/**/*.scss',
    dest: 'www/css',
}

const scripts = {
    buildName: 'babel',
    builder: 'GJavaScriptBuilder',
    src: 'assets/js/**/*.js',
    dest: 'www/js',
}

const build = {
    buildName: '@build',
    triggers: tron.parallel(scss, scripts),
    clean: 'www/{css,js}'
}

tron.createProject(build)
    .addWatcher({
        watch: 'www/**/*.html',
        browserSync: { server: 'www' }
    })
    .addCleaner();
```

Check **[examples](examples)** directory for more working examples.


//TODO: logo
<p align="center">
  <img class="logo" src="https://shnam7.github.io/gulp-tron/images/gulp-tron.svg" width="64px">
  <p align=center>Copyright &copy; 2020, under <a href="./LICENSE">MIT</a></p>
</div>
