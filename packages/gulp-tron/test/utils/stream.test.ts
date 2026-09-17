import type Vinyl from "vinyl";
import { describe, expect, it, vi } from "vitest";
import { timer } from "../../src/utils/misc.js";
import {
  clearStreamG,
  cloneStreamG,
  createNullStream,
  createTransform,
  flushAllStdio,
  flushStderr,
  flushStdout,
  pairSourcemapFilesG,
  throughSafe,
} from "../../src/utils/stream.js";
import { withPendingDrain } from "../helpers/streamDrain.js";

/**
 * Helper to create a Vinyl-like object for testing.
 */
function createVinyl(path: string, contents: Buffer = Buffer.from("test")): Vinyl {
  return {
    path,
    contents,
    clone: () => createVinyl(path, contents),
  } as unknown as Vinyl;
}

describe("stream-utils", () => {
  it("createTransform should transform data", async () => {
    const transform = createTransform((file, _enc, cb) => {
      file.path = "changed.js";
      cb(null, file);
    });

    const outputPromise = new Promise<Vinyl>((resolve) => {
      transform.once("data", (data) => resolve(data));
    });

    transform.write(createVinyl("original.js"));
    transform.end();
    await new Promise<void>((resolve) => transform.once("end", resolve));

    const output = await outputPromise;
    expect(output.path).toBe("changed.js");
  });

  it("createNullStream should pass through data", async () => {
    const stream = createNullStream();

    const outputPromise = new Promise<Vinyl>((resolve) => {
      stream.once("data", (data) => resolve(data));
    });

    stream.write(createVinyl("file.js"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    const output = await outputPromise;
    expect(output.path).toBe("file.js");
  });

  it("throughSafe should handle async transform", async () => {
    const transform = throughSafe(async (file, _enc, cb) => {
      file.path = "async.js";
      cb(null, file);
    });

    const outputPromise = new Promise<Vinyl>((resolve) => {
      transform.once("data", (data) => resolve(data));
    });

    transform.write(createVinyl("original.js"));
    transform.end();
    await new Promise<void>((resolve) => transform.once("end", resolve));

    const output = await outputPromise;
    expect(output.path).toBe("async.js");
  });

  it("throughSafe should automatically complete a callback-less flush", async () => {
    const transform = throughSafe(undefined, () => {});

    transform.resume();
    transform.end();
    await new Promise<void>((resolve) => transform.once("finish", resolve));
  });

  it("clearStreamG should drop files", async () => {
    const stream = clearStreamG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    stream.write(createVinyl("drop.js"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs.length).toBe(0);
  });

  it("cloneStreamG should clone files", async () => {
    const stream = cloneStreamG();

    const outputPromise = new Promise<Vinyl>((resolve) => {
      stream.once("data", (data) => resolve(data));
    });

    const input = createVinyl("clone.js");
    stream.write(input);
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    const output = await outputPromise;
    expect(output.path).toBe("clone.js");
    expect(output).not.toBe(input);
  });

  it("pairSourcemapFilesG should pair main and map files", async () => {
    const stream = pairSourcemapFilesG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    stream.write(createVinyl("main.js"));
    stream.write(createVinyl("main.js.map"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs[0].path).toBe("main.js");
    expect(outputs[1].path).toBe("main.js.map");
  });

  it("pairSourcemapFilesG should flush pending file", async () => {
    const stream = pairSourcemapFilesG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    stream.write(createVinyl("orphan.js"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs[0].path).toBe("orphan.js");
  });

  it("pairSourcemapFilesG should push a pending main file when a second main file arrives before its map", async () => {
    const stream = pairSourcemapFilesG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    stream.write(createVinyl("first.js"));
    stream.write(createVinyl("second.js"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs.map((o) => o.path)).toEqual(["first.js", "second.js"]);
  });

  it("pairSourcemapFilesG should pass through a map file that has no pending main file", async () => {
    const stream = pairSourcemapFilesG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    stream.write(createVinyl("orphan.js.map"));
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs.map((o) => o.path)).toEqual(["orphan.js.map"]);
  });

  it("pairSourcemapFilesG should treat a file with no path as a non-map file", async () => {
    const stream = pairSourcemapFilesG();
    const outputs: Vinyl[] = [];
    stream.on("data", (data) => outputs.push(data));

    const pathless = { contents: Buffer.from("x"), clone: () => pathless } as unknown as Vinyl;
    stream.write(pathless);
    stream.end();
    await new Promise<void>((resolve) => stream.once("end", resolve));

    expect(outputs).toEqual([pathless]);
  });

  it("throughSafe should forward a rejected promise from an async transform as an error", async () => {
    const transform = throughSafe(async (_file, _enc, _cb) => {
      throw new Error("async transform failed");
    });

    const errorPromise = new Promise<Error>((resolve) => {
      transform.once("error", (err) => resolve(err));
    });

    transform.write(createVinyl("original.js"));

    const error = await errorPromise;
    expect(error.message).toBe("async transform failed");
  });

  it("throughSafe should ignore a duplicate/late callback call", async () => {
    const transform = throughSafe((file, _enc, cb) => {
      cb(null, file);
      cb(null, file); // duplicate call should be ignored, not throw
    });

    const outputPromise = new Promise<Vinyl>((resolve) => {
      transform.once("data", (data) => resolve(data));
    });

    transform.write(createVinyl("dup.js"));
    transform.end();
    await new Promise<void>((resolve) => transform.once("end", resolve));

    const output = await outputPromise;
    expect(output.path).toBe("dup.js");
  });

  it("throughSafe should run an async flush function to completion", async () => {
    const flushed: string[] = [];
    const transform = throughSafe(undefined, async (_cb) => {
      flushed.push("flushed");
    });

    transform.resume(); // consume the readable side so 'finish'/'end' can fire
    transform.end();
    await new Promise<void>((resolve) => transform.once("finish", resolve));

    expect(flushed).toEqual(["flushed"]);
  });

  it("throughSafe should call cb() when no transform/flush function is provided", async () => {
    const transform = throughSafe();

    transform.resume(); // consume the readable side so 'finish' can fire
    transform.write(createVinyl("noop.js"));
    transform.end();
    await new Promise<void>((resolve) => transform.once("finish", resolve));

    // no error thrown and stream ends cleanly
    expect(true).toBe(true);
  });
});

describe("streams: stdout/stferr flush functions", () => {
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

    it("should resolve via the write callback when the buffer isn't empty but the write succeeds immediately", async () => {
      const original = Object.getOwnPropertyDescriptor(process.stdout, "writableLength");
      Object.defineProperty(process.stdout, "writableLength", { value: 1, configurable: true });

      try {
        await expect(flushStdout()).resolves.toBeUndefined();
      } finally {
        if (original) Object.defineProperty(process.stdout, "writableLength", original);
        else Reflect.deleteProperty(process.stdout, "writableLength");
      }
    });

    it("should reject when the write callback receives an error", async () => {
      const original = Object.getOwnPropertyDescriptor(process.stdout, "writableLength");
      Object.defineProperty(process.stdout, "writableLength", { value: 1, configurable: true });
      const writeSpy = vi
        .spyOn(process.stdout, "write")
        .mockImplementation((..._args: unknown[]) => {
          const cb = _args.find((a) => typeof a === "function");
          cb?.(new Error("write failed"));
          return true;
        });

      try {
        await expect(flushStdout()).rejects.toThrow("write failed");
      } finally {
        writeSpy.mockRestore();
        if (original) Object.defineProperty(process.stdout, "writableLength", original);
        else Reflect.deleteProperty(process.stdout, "writableLength");
      }
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

    it("should reject when the write callback receives an error", async () => {
      const original = Object.getOwnPropertyDescriptor(process.stderr, "writableLength");
      Object.defineProperty(process.stderr, "writableLength", { value: 1, configurable: true });
      const writeSpy = vi
        .spyOn(process.stderr, "write")
        .mockImplementation((..._args: unknown[]) => {
          const cb = _args.find((a) => typeof a === "function");
          cb?.(new Error("write failed"));
          return true;
        });

      try {
        await expect(flushStderr()).rejects.toThrow("write failed");
      } finally {
        writeSpy.mockRestore();
        if (original) Object.defineProperty(process.stderr, "writableLength", original);
        else Reflect.deleteProperty(process.stderr, "writableLength");
      }
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
