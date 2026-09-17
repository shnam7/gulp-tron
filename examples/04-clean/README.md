# gulp-tron Sample: Cleanup Strategy

## Overview

This example demonstrates file cleanup patterns:
- Specifying cleanup patterns with task-level `clean` config
- Auto-generated `@clean` task that collects all cleanup targets
- Conditional cleanup (when `clean` is specified vs when it's omitted)
- Cleanup logging and verification

## When to use this pattern

- You need to remove old build artifacts before running a fresh build
- You have multiple tasks, each with their own output directories to clean
- You want to verify what gets cleaned and trace cleanup behavior through logging

## Key learning points

1. **Task-level clean**: Declare `clean: "dist"` in TaskConfig to enable cleanup
2. **Auto-generated @clean**: `tron.addCleaner()` creates a task that cleans all registered targets
3. **Cleanup selection**: Only tasks with matching `target` patterns contribute to cleanup
4. **No default cleanup**: If no task specifies `clean`, `@clean` is not auto-generated

## Running the example

```bash
cd examples/04-clean
bun install
bun run clean        # run the auto-generated @clean task
bun run build        # run build (may include cleanup)
npx gulp --tasks     # show generated tasks
```

Watch the console output to see which files are being cleaned and from where.
