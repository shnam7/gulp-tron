import fs from "node:fs/promises";
import type { TransformCallback } from "node:stream";
import type { BuildStream, LogOptions } from "gulp-tron";
import * as yaml from "js-yaml";
import { glob } from "tinyglobby";
import File from "vinyl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type DataFunctionCallback,
  dataP,
  loadDataAsync,
  type VinylWithData,
} from "../src/data.js";

vi.mock("node:fs/promises");
vi.mock("tinyglobby");
vi.mock("js-yaml");

interface MockLogger {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  log: ReturnType<typeof vi.fn>;
}

interface MockBuildStream extends Omit<BuildStream, "intercept" | "opts" | "logger"> {
  opts: LogOptions;
  logger: typeof console;
  intercept: (
    cb: (file: VinylWithData, enc: string, cb: TransformCallback) => Promise<void>,
  ) => MockBuildStream;
}

describe("gulp-tron dataP Plugin Test Suite", () => {
  let mockLogger: MockLogger;
  let mockBuildStream: MockBuildStream;
  let interceptCallback:
    | ((file: VinylWithData, enc: string, cb: TransformCallback) => Promise<void>)
    | null = null;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockLogger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
    };

    mockBuildStream = {
      opts: { logLevel: "info" },
      logger: mockLogger as unknown as typeof console,
      intercept: vi.fn(
        (cb: (file: VinylWithData, enc: string, cb: TransformCallback) => Promise<void>) => {
          interceptCallback = cb;
          return mockBuildStream;
        },
      ),
    } as unknown as MockBuildStream;
  });

  describe("loadDataAsync Function Tests", () => {
    it("should correctly parse YAML and JSON files and merge data", async () => {
      vi.mocked(glob).mockResolvedValue(["src/config.yaml", "src/user.json"]);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce("siteName: Test")
        .mockResolvedValueOnce('{"version": "1.0"}');
      vi.mocked(yaml.load).mockReturnValue({ siteName: "Test" });

      const result = await loadDataAsync("src/**/*");

      expect(result).toEqual({
        config: { siteName: "Test" },
        user: { version: "1.0" },
      });
    });

    it("should trigger a warning log when an unsupported file extension is found", async () => {
      vi.mocked(glob).mockResolvedValue(["src/image.png"]);

      const result = await loadDataAsync("src/**/*", {
        logger: mockLogger as unknown as typeof console,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("skipping unsupported file type"),
      );
      expect(result).toEqual({});
    });

    it("should handle disk read errors gracefully and log an error", async () => {
      vi.mocked(glob).mockResolvedValue(["src/broken.json"]);
      vi.mocked(fs.readFile).mockRejectedValue(new Error("Disk Read Error"));

      const result = await loadDataAsync("src/**/*", {
        logger: mockLogger as unknown as typeof console,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("failed to read file"),
        expect.any(Error),
      );
      expect(result).toEqual({});
    });

    it("should output info logs when verbose mode is enabled", async () => {
      vi.mocked(glob).mockResolvedValue([]);
      await loadDataAsync("src/**/*", {
        logLevel: "verbose",
        logger: mockLogger as unknown as typeof console,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe("dataP Plugin Stream Pipeline Tests", () => {
    let mockFile: VinylWithData;

    beforeEach(() => {
      mockFile = new File({
        path: "src/pages/index.html",
        contents: Buffer.from("<h1>Hello</h1>"),
      }) as VinylWithData;
    });

    it("should latch static glob patterns and bind cached files data onto file.data", async () => {
      vi.mocked(glob).mockResolvedValue(["src/global.json"]);
      vi.mocked(fs.readFile).mockResolvedValue('{"author": "Tron"}');

      const plugin = dataP("src/global.json");
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(mockFile.data).toHaveProperty("global");
      const globalData = mockFile.data?.global as Record<string, unknown>;
      expect(globalData?.author).toBe("Tron");
      expect(streamCallback).toHaveBeenCalledWith(null, mockFile);
    });

    it("should forward stream exceptions down the pipeline if static caching fails", async () => {
      vi.mocked(glob).mockRejectedValue(new Error("Glob Failure"));

      const plugin = dataP("src/global.json");
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(streamCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should accept synchronous object declarations from dynamic callbacks", async () => {
      const customFunc = () => ({ mode: "production" });

      const plugin = dataP(customFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(mockFile.data?.mode).toBe("production");
      expect(streamCallback).toHaveBeenCalledWith(null, mockFile);
    });

    it("should await async/promise mappings safely and assign resolved objects", async () => {
      const customAsyncFunc = async () => {
        return { dynamicKey: "asyncValue" };
      };

      const plugin = dataP(customAsyncFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(mockFile.data?.dynamicKey).toBe("asyncValue");
      expect(streamCallback).toHaveBeenCalledWith(null, mockFile);
    });

    it("should fall back gracefully to old-school node-style callback declarations", async () => {
      const customCallbackFunc = (_file: VinylWithData, cb: DataFunctionCallback) => {
        cb(null, { callbackKey: "callbackValue" });
      };

      const plugin = dataP(customCallbackFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(mockFile.data?.callbackKey).toBe("callbackValue");
      expect(streamCallback).toHaveBeenCalledWith(null, mockFile);
    });

    it("should bubble errors up the pipeline if the internal callback receives an error instance", async () => {
      const customCallbackFunc = (_file: VinylWithData, cb: DataFunctionCallback) => {
        cb(new Error("Callback Error"));
      };

      const plugin = dataP(customCallbackFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(streamCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should fail gracefully and bubble standard try/catch throw statements up the stream", async () => {
      const faultyFunc = () => {
        throw new Error("Runtime Exception");
      };

      const plugin = dataP(faultyFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      expect(streamCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should coerce unexpected string exceptions into error definitions gracefully", async () => {
      const weirdFaultyFunc = () => {
        throw "String Exception";
      };

      const plugin = dataP(weirdFaultyFunc);
      plugin(mockBuildStream as unknown as BuildStream);

      const streamCallback = vi.fn() as unknown as TransformCallback;
      if (interceptCallback) {
        await interceptCallback(mockFile, "utf8", streamCallback);
      }

      const calls = vi.mocked(streamCallback).mock.calls;
      const errorArg = calls[0][0] as Error;
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toBe("String Exception");
    });
  });
});
