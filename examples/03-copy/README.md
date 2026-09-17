# gulp-tron Sample: Copy Operations

## Overview

This example demonstrates file copying with gulp-tron:
- Single source to destination copies
- Multiple source-to-destination pairs (bulk copy)
- Copy-only-changed behavior (default)
- Copy as part of a build pipeline with other tasks

## When to use this pattern

- You need to copy static assets (images, fonts, configs) to output directories
- You want to avoid re-copying unchanged files (performance optimization)
- You're combining copy operations with other build steps (minification, etc.)

## Key learning points

1. **BuildStream.copy()**: Delegates to `copy-changed` package (copy only changed files)
2. **Two call patterns**: `copy(globs, dest)` vs `copy(params)` for bulk operations
3. **Copy vs other operations**: Integrates seamlessly into the stream pipeline
4. **Failed copies propagate**: Copy failures now reject the build promise

## Running the example

```bash
cd examples/03-copy
bun install
bun run build        # run copy and other tasks
npx gulp --tasks     # show generated tasks
```

Check the output directories to see copied files.
