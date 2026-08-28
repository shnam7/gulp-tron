/**
 * A minimal stand-in for the object gulp.watch() returns, just enough to
 * register listeners and fire them manually from a test (e.g. simulating
 * a file-change event without touching the real filesystem watcher).
 */
export function makeFakeWatcher() {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  return {
    on(event: string, cb: (...args: unknown[]) => void) {
      listeners[event] ??= [];
      listeners[event].push(cb);
      return this;
    },
    emit(event: string, ...args: unknown[]) {
      for (const cb of listeners[event] ?? []) cb(...args);
    },
  };
}
