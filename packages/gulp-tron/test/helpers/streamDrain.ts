import { vi } from "vitest";

/**
 * Simulates a Writable stream (process.stdout/process.stderr) that has
 * pending buffered data (`writableLength`) and fires its 'drain' event
 * synchronously once a listener subscribes. Call `restore()` afterward
 * to undo both the `once` spy and the `writableLength` override.
 */
export function withPendingDrain(stream: NodeJS.WriteStream, pendingBytes = 10) {
  const onceSpy = vi.spyOn(stream, "once").mockImplementation(function (
    this: NodeJS.WriteStream,
    event: string | symbol,
    cb: (...args: unknown[]) => void,
  ) {
    if (event === "drain") cb();
    return this;
  });
  const originalDescriptor = Object.getOwnPropertyDescriptor(stream, "writableLength");
  Object.defineProperty(stream, "writableLength", { value: pendingBytes, configurable: true });

  function restore() {
    if (originalDescriptor) {
      Object.defineProperty(stream, "writableLength", originalDescriptor);
    } else {
      // No own property existed before (writableLength is normally
      // inherited from the Writable prototype's getter) — deleting our
      // added own property restores that, rather than leaving it stuck
      // at `pendingBytes` forever and hanging every later flush.
      delete (stream as unknown as Record<string, unknown>).writableLength;
    }
    onceSpy.mockRestore();
  }

  return { onceSpy, restore };
}
