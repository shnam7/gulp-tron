import process from "node:process";
import { describe, expect, it } from "vitest";
import { flushAllStdio, flushStderr, flushStdout, timer } from "../../src/utils/index.js";
import { withPendingDrain } from "../helpers/index.js";

describe("utils/index", () => {
  describe("flushStdout", () => {
    it("should resolve immediately when the stdout buffer is empty", async () => {
      await expect(flushStdout()).resolves.toBeUndefined();
    });

    it("should wait for the 'drain' event when the stdout buffer is not empty", async () => {
      const { onceSpy, restore } = withPendingDrain(process.stdout);

      await expect(flushStdout()).resolves.toBeUndefined();
      expect(onceSpy).toHaveBeenCalledWith("drain", expect.any(Function));

      restore();
    });
  });

  describe("flushStderr", () => {
    it("should resolve immediately when the stderr buffer is empty", async () => {
      await expect(flushStderr()).resolves.toBeUndefined();
    });

    it("should wait for the 'drain' event when the stderr buffer is not empty", async () => {
      const { onceSpy, restore } = withPendingDrain(process.stderr);

      await expect(flushStderr()).resolves.toBeUndefined();
      expect(onceSpy).toHaveBeenCalledWith("drain", expect.any(Function));

      restore();
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
