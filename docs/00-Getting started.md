# Getting Started with Tron (gulp-tron)

Tron is a modern build system built on top of Gulp, designed for scalable, maintainable, and highly customizable build pipelines. This guide will help you get started quickly, referencing real-world examples from the `examples/` directory.

## Installation

Install Tron and its peer dependencies:

```bash
npm install gulp-tron gulp
```

## Project Structure Example

See the `examples/` directory for ready-to-use sample projects:

-   `examples/00-getting-started/`
-   `examples/01-conf/`
-   `examples/02-task/`
-   `examples/03-copy/`
-   `examples/04-clean/`
-   `examples/05-plugins/`
-   ...and more

Each example contains a `gulpfile.js`, sample source files, and a `README.md` explaining the scenario.

## Basic Usage

Create a `gulpfile.js`:

```js
const {Tron} = require('gulp-tron')
const tron = new Tron()

tron.task('build', bs => bs.src('src/**/*.js').pipe(/* ... */).dest('dist/js'))
tron.addCleaner({clean: ['dist']})
tron.addWatcher()
```

Run your build:

```bash
gulp build
```

## Example: Getting Started

See [`examples/00-getting-started/gulpfile.js`](../examples/00-getting-started/gulpfile.js):

```js
const {Tron} = require('gulp-tron')
const tron = new Tron()

tron.task('default', bs => bs.src('src/**/*.js').pipe(bs.dest('public/js')))
```

## Example: Task Configuration

See [`examples/01-conf/gulpfile.js`](../examples/01-conf/gulpfile.js):

```js
const {Tron} = require('gulp-tron')
const tron = new Tron()

tron.task({
    name: 'scripts',
    src: 'src/**/*.js',
    dest: 'public/js',
    build(bs) {
        bs.pipe(/* plugin */)
    },
})
```

## Example: Copy & Clean

See [`examples/03-copy/gulpfile.js`](../examples/03-copy/gulpfile.js):

```js
tron.task('copy-assets', bs => bs.copy('src/assets/**/*', 'public/assets'))
tron.addCleaner({clean: ['public/assets']})
```

## Example: Plugins

See [`examples/05-plugins/gulpfile.js`](../examples/05-plugins/gulpfile.js):

```js
tron.task('styles', bs =>
    bs.src('scss/**/*.scss').pipe(require('gulp-sass')()).pipe(bs.dest('public/css')),
)
```

## More Examples

Explore the `examples/` directory for advanced scenarios:

-   Task dependencies and triggers
-   Pattern-based task selection
-   Custom plugins and stream logic
-   Integration with browserSync

## Documentation

-   [Tron Class Documentation](./01-Tron.md)
-   [BuildStream Class Documentation](./01-BuildStream.md)

## Next Steps

-   Try modifying the example gulpfiles to fit your project
-   Explore advanced features like `selectTasks`, `series`, and `parallel`
-   Read the full API docs for deeper customization

---

For questions or feedback, see the project repository or open an issue.
