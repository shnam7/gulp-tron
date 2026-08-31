import type { Writable } from "node:stream";
import { vi } from "vitest";

/**
 * Makes `stream` behave as if its internal buffer is full: `writableLength`
 * reads as non-zero and `write()` returns `false`, then a `drain` event is
 * emitted on the next tick so callers waiting on it can resolve.
 */
export function withPendingDrain(stream: Writable) {
  const originalWritableLength = Object.getOwnPropertyDescriptor(stream, "writableLength");
  Object.defineProperty(stream, "writableLength", { value: 1, configurable: true });

  const writeSpy = vi.spyOn(stream, "write").mockImplementation((..._args: unknown[]) => {
    const cb = _args.find((a) => typeof a === "function");
    // Invoke the write callback with no error (mirrors a real failed-to-fully-flush
    // write) so the `if (success) resolve()` false branch runs, then emit 'drain'
    // so the fallback listener resolves the promise. Both are deferred past the
    // `return false` below, since `success` isn't assigned until write() returns.
    process.nextTick(() => cb?.(null));
    queueMicrotask(() => stream.emit("drain"));
    return false;
  });
  const onceSpy = vi.spyOn(stream, "once");

  return {
    onceSpy,
    restore: () => {
      writeSpy.mockRestore();
      onceSpy.mockRestore();
      if (originalWritableLength) {
        Object.defineProperty(stream, "writableLength", originalWritableLength);
      } else {
        Reflect.deleteProperty(stream, "writableLength");
      }
    },
  };
}
