import gulp from "gulp";
import type { GulpTaskName } from "../../src/types.js";

/**
 * Runs a registered gulp task and waits for it to fully complete,
 * regardless of whether the resolved task signals completion via the
 * done-callback convention, a returned Promise, or both — some resolved
 * buildSet shapes end up as a single, plain callback-style gulp task
 * (not wrapped in gulp.series/BuildStream.main's promise), so a bare
 * no-op callback would never observe real completion.
 */
export function execTask(taskName: GulpTaskName): Promise<void> {
  const wrapperTask = gulp.task(taskName);
  if (!wrapperTask) throw new Error(`Task "${taskName}" is not defined`);

  return new Promise<void>((resolve, reject) => {
    const maybePromise = wrapperTask((err?: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
    if (maybePromise && typeof (maybePromise as { then?: unknown }).then === "function") {
      (maybePromise as Promise<unknown>).then(() => resolve(), reject);
    }
  });
}
