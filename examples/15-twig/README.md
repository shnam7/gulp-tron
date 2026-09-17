# gulp-tron Sample: Twig Templating

## Overview

This example demonstrates template-based static site generation with Twig:
- Twig template compilation (Jinja2-like templating)
- Template data injection
- Stylesheet and script processing
- Static site artifact generation with live reload

## When to use this pattern

- You prefer Twig's syntax (familiar from Symfony, Joomla, etc.)
- You need flexible template rendering with data context
- You're building a multi-page static site with shared layouts

## Key learning points

1. **Twig builder**: Compiles Twig templates to static HTML
2. **Data context**: Pass site-wide data to templates
3. **Reusable layouts**: Base templates and includes reduce boilerplate
4. **Holistic pipeline**: Templates, styles, and scripts build together

## Running the example

```bash
cd examples/15-twig
bun install
bun run build        # render Twig templates + compile styles/scripts
bun run watch        # watch all sources and rebuild on change
```
