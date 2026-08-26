import process from "node:process";
import { describe, expect, it, vi } from "vitest";
import { flushAllStdio, flushStderr, flushStdout, timer } from "../../src/utils/index.js";

describe("utils/index", () => {
  describe("flushStdout", () => {
    it("should resolve immediately when the stdout buffer is empty", async () => {
      await expect(flushStdout()).resolves.toBeUndefined();
    });

    it("should wait for the 'drain' event when the stdout buffer is not empty", async () => {
      const onceSpy = vi.spyOn(process.stdout, "once").mockImplementation(function (
        this: typeof process.stdout,
        event: string | symbol,
        cb: (...args: unknown[]) => void,
      ) {
        if (event === "drain") cb();
        return this;
      });
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "writableLength");
      Object.defineProperty(process.stdout, "writableLength", { value: 10, configurable: true });

      await expect(flushStdout()).resolves.toBeUndefined();
      expect(onceSpy).toHaveBeenCalledWith("drain", expect.any(Function));

      if (originalDescriptor) {
        Object.defineProperty(process.stdout, "writableLength", originalDescriptor);
      } else {
        // No own property existed before (writableLength is normally
        // inherited from the Writable prototype's getter) — deleting our
        // added own property restores that, rather than leaving it stuck
        // at 10 forever and hanging every later flush.
        delete (process.stdout as unknown as Record<string, unknown>).writableLength;
      }
      onceSpy.mockRestore();
    });
  });

  describe("flushStderr", () => {
    it("should resolve immediately when the stderr buffer is empty", async () => {
      await expect(flushStderr()).resolves.toBeUndefined();
    });

    it("should wait for the 'drain' event when the stderr buffer is not empty", async () => {
      const onceSpy = vi.spyOn(process.stderr, "once").mockImplementation(function (
        this: typeof process.stderr,
        event: string | symbol,
        cb: (...args: unknown[]) => void,
      ) {
        if (event === "drain") cb();
        return this;
      });
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.stderr, "writableLength");
      Object.defineProperty(process.stderr, "writableLength", { value: 10, configurable: true });

      await expect(flushStderr()).resolves.toBeUndefined();
      expect(onceSpy).toHaveBeenCalledWith("drain", expect.any(Function));

      if (originalDescriptor) {
        Object.defineProperty(process.stderr, "writableLength", originalDescriptor);
      } else {
        delete (process.stderr as unknown as Record<string, unknown>).writableLength;
      }
      onceSpy.mockRestore();
    });
  });

  describe("flushAllStdio", () => {
    it("should resolve once both stdout and stderr are flushed", async () => {
      await expect(flushAllStdio()).resolves.toBeUndefined();
    });
  });

  describe("timer", () => {
    it("should resolve after the given delay", async () => {
      const start = Date.now();
      await timer(10);
      expect(Date.now() - start).toBeGreaterThanOrEqual(0);
    });
  });
});
