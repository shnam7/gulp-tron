# gulp-tron Sample: Task Configuration

## Overview

This example demonstrates how to define and register tasks using different configuration patterns:
- Simple task objects passed to `tron.task()`
- Bulk task registration using `tron.createTasks()`
- Shared build options applied across multiple tasks
- Series and parallel task execution ordering

## When to use this pattern

- You have multiple similar tasks that share configuration (e.g., same `dest`, `logLevel`, options)
- You need to run tasks in a specific sequence (series) or all at once (parallel)
- You want to understand task dependency and triggering behavior

## Key learning points

1. **TaskConfig**: Plain objects describing what a task does
2. **Shared options**: Use `BuildOptions` to avoid repetition
3. **Series vs Parallel**: Control task execution flow with `tron.series()` and `tron.parallel()`
4. **Task selection**: Patterns in `dependsOn`/`triggers` resolve at execution time

## Running the example

```bash
cd examples/01-conf
bun install
bun run build        # run the main build task
npx gulp --tasks     # inspect generated tasks
```

Watch the console output to see task execution order: series runs sequentially, parallel runs concurrently.
