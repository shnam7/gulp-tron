# gulp-tron Sample: Markdown Publishing

## Overview

This example demonstrates markdown processing and static site generation:
- Markdown to HTML conversion
- Stylesheet compilation alongside markdown
- Content organization and routing
- Watchable static site rebuild

## When to use this pattern

- You're building a static site, documentation, or blog from Markdown
- You need to process both content (Markdown) and styling (SCSS) together
- You want live preview with watch/reload capability

## Key learning points

1. **Parallel processing**: Markdown and SCSS tasks run independently, triggered together
2. **Unified output**: Content and styles converge to a single `www` or `dist` folder
3. **Watch integration**: Both content and styling changes trigger rebuild

## Running the example

```bash
cd examples/13-markdown
bun install
bun run build        # build HTML from Markdown + SCSS
bun run watch        # watch for changes and rebuild
```
