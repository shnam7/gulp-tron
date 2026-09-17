# gulp-tron Sample: Style Compilation

## Overview

This example demonstrates stylesheet processing with plugin-based builders:
- SCSS compilation with source maps
- PostCSS transformations (autoprefixing, etc.)
- LESS compilation
- Multi-format stylesheet pipelines
- Watching stylesheets during development

## When to use this pattern

- Your project uses SCSS, LESS, or PostCSS for stylesheets
- You need vendor prefixing or other PostCSS transforms
- You want a unified stylesheet build across multiple input formats

## Key learning points

1. **Plugin builders**: Use `@gulp-tron/plugin-styles` for common stylesheet tasks
2. **Source maps**: Enable with `sourcemaps: true` in task config
3. **Plugin composition**: Chain multiple style plugins for complex transforms
4. **Watch integration**: Stylesheet tasks automatically included in `@watch`

## Running the example

```bash
cd examples/10-styles
bun install
bun run build        # compile all stylesheets
bun run watch        # watch and recompile on change
```
