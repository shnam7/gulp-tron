# gulp-tron Sample: Script Compilation

## Overview

This example demonstrates JavaScript/TypeScript processing with plugin-based builders:
- Vanilla JavaScript (linting with ESLint)
- ES6+ to ES5 transpilation (Babel)
- CoffeeScript compilation
- TypeScript compilation
- Minification (Terser)
- Concatenation and bundling

## When to use this pattern

- Your project includes multiple script formats (JS, TS, CoffeeScript)
- You need language transpilation and/or linting
- You want to minify and bundle outputs

## Key learning points

1. **Plugin builders**: Use `@gulp-tron/plugin-scripts` for script transformations
2. **Language variety**: Each source format gets its own task, unified through parallel/series
3. **Linting first**: ESLint validates code before processing
4. **Optimization**: Terser and concatenation optimize final output

## Running the example

```bash
cd examples/11-scripts
bun install
bun run build        # compile all scripts
bun run watch        # watch and recompile on change
```
