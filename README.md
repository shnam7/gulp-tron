# gulp-tron

[![npm package](https://img.shields.io/npm/v/gulp-tron.svg)](https://www.npmjs.com/package/gulp-tron) [![node compatibility](https://img.shields.io/node/v/gulp-tron.svg)](https://nodejs.org/en/about/previous-releases) [![build status](https://github.com/shnam7/gulp-tron/actions/workflows/ci.yml/badge.svg)](https://github.com/shnam7/gulp-tron/actions/workflows/ci.yml)

Easy-to-use, configuration-driven build manager for Gulp-based projects.

- Simple task creation through configuration
- Fluent API for manipulating build streams
- Dependency management for task execution
- Automatic generation of `@clean` and `@watch` tasks
- BrowserSync integration for watch workflows
- Plugin support for extending and reusing build pipelines

## Packages

| Package                                                | Description                             |
| ------------------------------------------------------ | --------------------------------------- |
| [`gulp-tron`](packages/gulp-tron)                      | Core task manager and `BuildStream` API |
| [`@gulp-tron/plugin-scripts`](packages/plugin-scripts) | JavaScript and TypeScript build plugins |
| [`@gulp-tron/plugin-styles`](packages/plugin-styles)   | Stylesheet build plugins                |
| [`@gulp-tron/plugin-utils`](packages/plugin-utils)     | Shared build utilities                  |

## Documentation

- [Getting Started](docs/00-Getting%20started.md)
- [Tron API](docs/01-Tron.md)
- [BuildStream API](docs/02-BuildStream.md)
- [Type Reference](docs/04-Types.md)

## License

[MIT](LICENSE)
