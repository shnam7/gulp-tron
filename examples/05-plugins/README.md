# gulp-tron Sample: Custom Plugins and Extensions

## Overview

This example demonstrates plugin architecture within gulp-tron:
- Creating custom builder functions (PluginFunction pattern)
- Integrating custom builders into tasks via `chain()` or `pipe()`
- Creating reusable, composable build steps
- Mixing custom logic with gulp-tron's fluent API

## When to use this pattern

- You have project-specific or niche transformations not covered by standard gulp plugins
- You want to extract reusable build logic into named, testable functions
- You're combining custom transformations with standard file operations (copy, rename, etc.)

## Key learning points

1. **PluginFunction**: `(bs: BuildStream) => void` — receives the stream, adds operations
2. **Integration methods**: Use `chain()` to add sync work or `pipe()` for stream transformations
3. **Reusability**: Package builder functions as named exports for import in other tasks
4. **Composability**: Plugins can call other plugins, building complex pipelines from simple parts

## Running the example

```bash
cd examples/05-plugins
bun install
bun run build        # run build with custom plugins
npx gulp --tasks     # show generated tasks
```

Examine `gulp-tron-plugins/my-scss.js` to see a custom builder pattern in action.
