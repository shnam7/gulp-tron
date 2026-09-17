# gulp-tron Sample: Task Basics

## Overview

This example covers fundamental task creation and execution patterns:
- Creating tasks with `tron.task(name, buildFunc, options)` overload
- Console output and logging within build functions
- Task dependencies using `dependsOn`
- Task triggers using `triggers`
- Complex BuildSet compositions (series/parallel nesting)

## When to use this pattern

- You're new to gulp-tron and need to understand task basics
- You need to debug task execution flow and order
- You want to see how `dependsOn` and `triggers` resolve to actual gulp tasks

## Key learning points

1. **BuildFunction signature**: `(bs: BuildStream) => Promise<unknown> | undefined`
2. **BuildSet resolution**: Task names, functions, and configs all resolve to gulp tasks
3. **Dependency vs Trigger**: Dependencies run before; triggers run after
4. **Composition**: Nesting series/parallel creates complex execution trees

## Running the example

```bash
cd examples/02-task
bun install
bun run build        # run the main build
npx gulp --tasks     # show task tree
```
