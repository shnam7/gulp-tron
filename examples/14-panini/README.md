# gulp-tron Sample: Panini Templating

## Overview

This example demonstrates template-based static site generation with Panini:
- Panini template compilation (handlebars-like templating)
- Template data and partial management
- Stylesheet processing alongside templates
- Static site artifact generation

For more on Panini, see [github.com/zurb/panini](https://github.com/zurb/panini).

## When to use this pattern

- You're building a documentation or marketing site with reusable templates
- You need data-driven template rendering (JSON/YAML data files)
- You want to organize templates as partials and layouts

## Key learning points

1. **Panini builder**: Templates compile to static HTML with data injection
2. **Data files**: Organizes template context in YAML/JSON
3. **Partials and layouts**: Reusable template components reduce duplication
4. **Integration**: Works alongside stylesheet compilation in a unified pipeline

## Running the example

```bash
cd examples/14-panini
bun install
bun run build        # render Panini templates + compile SCSS
bun run watch        # watch templates and styles
```
