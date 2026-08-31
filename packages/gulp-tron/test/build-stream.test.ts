import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { getSilentLogger } from "@wicle/tiny-logger";
import browserSync from "browser-sync";
import gulp from "gulp";
import { pEvent } from "p-event";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { BuildStream } from "../src/build-stream.js";
import type { BuildFunction } from "../src/types.js";
import { timer } from "../src/utils/misc.js";
import { throughSafe } from "../src/utils/stream.js";
import { captureStdio, createMockLogger, createTestFixture } from "./helpers/index.js";

vi.mock("browser-sync", () => ({
  default: {
    active: true,
    stream: vi.fn(() => new PassThrough({ objectMode: true })),
  },
}));

// Wrap the real copy-changed implementation so individual tests can
// override copyChangedAsync's behavior (e.g. mockRejectedValueOnce) while
// every other test keeps using the genuine implementation by default.
vi.mock("copy-changed", async (importOriginal) => {
  const actual = await importOriginal<typeof import("copy-changed")>();
  return { ...actual, copyChangedAsync: vi.fn(actual.copyChangedAsync) };
});

const { tmpDir, srcRoot, dest, scriptFile, styleFile, pkgFile, setup, cleanup } =
  createTestFixture("build-stream-test");

describe("BuildStream", () => {
  let bs: BuildStream;
  beforeEach(() => {
    vi.clearAllMocks();
    bs = new BuildStream("test-stream");
    setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Core structure", () => {
    it("should have getters", () => {
      expect(bs.name).toBe("test-stream");
      expect(bs.className).toBe("BuildStream");
      expect(bs.stream).toBeInstanceOf(PassThrough);
      expect(bs.promiseQ).toBeInstanceOf(Promise);
      expect(bs.opts).toEqual({});
      expect(bs.performance.startTime).toBeGreaterThan(0);
      expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime);
      expect(bs.logger.info).toBeInstanceOf(Function);
      expect(bs.logger.error).toBeInstanceOf(Function);
    });
    it("should execute build function", async () => {
      const buildFunc = vi.fn();
      const bs1 = new BuildStream("test");
      const result = await BuildStream.main(bs1, buildFunc);
      expect(buildFunc).toHaveBeenCalledWith(bs1);
      expect(result).toBe(bs1.stream);
    });
    it("should wait for the stream to finish when src() was called inside the build function", async () => {
      const bs1 = new BuildStream("test-main-src");
      const buildFunc: BuildFunction = (bs) => {
        bs.src(path.join(srcRoot, "**/*.*"));
      };
      const resultStream = await BuildStream.main(bs1, buildFunc);
      expect(resultStream).toBe(bs1.stream);
    });
  });

  describe("log method", () => {
    it("should do nothing when called with no arguments", () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("no-args", { logger: mockLogger });

      const result = named.log();

      expect(result).toBe(named);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should call the supplied opts.logger as-is, without forcing a prefix on it", () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("prefixed-stream", { logger: mockLogger });

      named.log("hello");

      // opts.logger is the caller's own logger, so it's used exactly as
      // given — this.log()/this.logger no longer build a prefixed string
      // themselves; the `[name]` prefix is only applied by the *default*
      // pino-backed logger (see the "default logger" test below).
      expect(mockLogger.info).toHaveBeenCalledWith("hello");
    });

    it("should expose the supplied opts.logger directly as this.logger, with no wrapper", () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("prefixed-stream", { logger: mockLogger });

      expect(named.logger).toBe(mockLogger);

      named.logger.error("boom");
      expect(mockLogger.error).toHaveBeenCalledWith("boom");
    });

    it("should tag the default logger's rendered output with [name] when no custom logger is given", async () => {
      const named = new BuildStream("prefixed-stream");
      const { stdout } = await captureStdio(() => {
        named.log("hello");
      });

      expect(stdout).toContain("[prefixed-stream]");
      expect(stdout).toContain("hello");
    });
  });

  describe("Constructor", () => {
    it("should initialize with no argument", () => {
      const bs = new BuildStream();
      expect(bs).toBeInstanceOf(BuildStream);
      expect(bs.name).toBe("<anonymous>");
      expect(bs.opts).toEqual({});
      expect(bs.stream).toBeInstanceOf(PassThrough);
      expect(bs.performance.startTime).toBeGreaterThan(0);
      expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime);
      expect(bs.promiseQ).toBeInstanceOf(Promise);
      expect(bs.logger.info).toBeInstanceOf(Function);
      expect(bs.logger.error).toBeInstanceOf(Function);
    });
    it("should initialize with name argument only", () => {
      const bs = new BuildStream("test-name");
      expect(bs).toBeInstanceOf(BuildStream);
      expect(bs.name).toBe("test-name");
      expect(bs.opts).toEqual({});
      expect(bs.stream).toBeInstanceOf(PassThrough);
      expect(bs.promiseQ).toBeInstanceOf(Promise);
      expect(bs.performance.startTime).toBeGreaterThan(0);
      expect(bs.performance.elapsedTime).toBeLessThan(bs.performance.startTime);
    });
    it("should initialize with custom options", () => {
      const customOpts = { dest: "./dist", sourcemaps: true };
      const bs1 = new BuildStream("custom-stream", customOpts);
      expect(bs1.name).toBe("custom-stream");
      expect(bs1.opts).toEqual(customOpts);
      expect(bs1.stream).toBeInstanceOf(PassThrough);
      expect(bs1.promiseQ).toBeInstanceOf(Promise);
    });
    it("should create an iinstance with name, stream, and promise arguments", () => {
      const stream = new PassThrough({ objectMode: true });
      const promiseSync = new Promise<void>((resolve) => {
        resolve();
      });
      const bs1 = new BuildStream("test-name", {}, stream, promiseSync);
      expect(bs1).toBeInstanceOf(BuildStream);
      expect(bs1.name).toBe("test-name");
      expect(bs1.opts).toEqual({});
      expect(bs1.stream).toBe(stream);
      // expect(bs.sync).toBe(promiseSync)
    });
  });

  describe("src method", () => {
    let mockSrc: MockInstance<typeof gulp.src>;

    beforeEach(() => {
      mockSrc = vi
        .spyOn(gulp, "src")
        .mockImplementation(() => new PassThrough({ objectMode: true }));
    });
    afterEach(() => {
      mockSrc.mockRestore();
    });

    it("should call src with string pattern", () => {
      const src = path.join(srcRoot, "**/*.js");
      const result = bs.src(src);
      expect(result).toBe(bs);
      expect(mockSrc).toHaveBeenCalledTimes(1);
      expect(mockSrc).toHaveBeenCalledWith(src, { encoding: false, sourcemaps: false });
    });
    it("should call src with array of patterns", () => {
      const src = [path.join(srcRoot, "**/*.js"), path.join(srcRoot, "**/*.ts")];
      const result = bs.src(src);
      expect(result).toBe(bs);
      expect(mockSrc).toHaveBeenCalledTimes(1);
      expect(mockSrc).toHaveBeenCalledWith(src, { encoding: false, sourcemaps: false });
    });
    it("should call src with no argument", () => {
      const result = bs.src();
      expect(result).toBe(bs);
      expect(mockSrc).toHaveBeenCalledTimes(1);
      expect(mockSrc).toHaveBeenCalledWith("", {
        encoding: false,
        sourcemaps: false,
      });
    });
    it("should keep sourcemaps as-is when it is already a function", () => {
      const sourcemapsFn = () => true;
      bs.src(path.join(srcRoot, "**/*.js"), { sourcemaps: sourcemapsFn });
      expect(mockSrc).toHaveBeenCalledWith(
        path.join(srcRoot, "**/*.js"),
        expect.objectContaining({ sourcemaps: sourcemapsFn }),
      );
    });
  });

  describe("add method", () => {
    it("should call src method when add is called before calling src", () => {
      const mockSrc = vi.spyOn(bs, "src");

      bs.add("**/*.js");

      expect(mockSrc).toHaveBeenCalledTimes(1);
      expect(mockSrc).toHaveBeenCalledWith("**/*.js", {});
      mockSrc.mockRestore();
    });
    it("should add files to the stream", async () => {
      const src1 = path.join(path.dirname(scriptFile), "**/*.js");
      const src2 = path.join(path.dirname(styleFile), "**/*.css");
      const files: string[] = [];

      bs.src(src1)
        .add(src2)
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");

      expect(files.length).toBe(2);
      expect(files).toContain(scriptFile);
      expect(files).toContain(styleFile);
    });
  });

  describe("remove method", () => {
    it("should remove files from the stream", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];

      bs.src(src)
        .remove("*.js")
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(2);
      expect(files).toContain(path.join(srcRoot, "styles/test.css"));
      expect(files).toContain(path.join(srcRoot, "package.json"));
    });
    it("should handle a pattern that is already negated", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];

      // "!*.js" already starts with "!" - remove() should not double-negate it
      bs.src(src)
        .remove("!*.js")
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(1);
      expect(files).toContain(path.join(srcRoot, "scripts/test.js"));
    });
  });

  describe("filter method", () => {
    it("should filter files in the stream", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      bs.src(src)
        .filter("*.css")
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(1);
      expect(files).toContain(path.join(srcRoot, "styles/test.css"));
    });
    it("should pass a filter function through unchanged", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      bs.src(src)
        .filter((file) => file.path.endsWith(".css"))
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files).toEqual([path.join(srcRoot, "styles/test.css")]);
    });
    it("should return this unchanged when patterns resolve to an empty list", () => {
      const result = bs.filter([123 as unknown as string]);
      expect(result).toBe(bs);
    });
  });

  describe("rename method", () => {
    it("should rename files in the stream", async () => {
      const src = path.join(srcRoot, "**/*.js");
      const files: string[] = [];
      bs.src(src)
        .rename({ suffix: ".min" })
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(1);
      expect(files[0]).toBe(path.join(srcRoot, "scripts/test.min.js"));
    });
  });

  describe("order method", () => {
    it("should order files in the stream", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      bs.src(src)
        .order(["styles/**", "scripts/**"])
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(3);
      expect(files[0]).toBe(path.join(srcRoot, "styles/test.css"));
      expect(files[1]).toBe(path.join(srcRoot, "scripts/test.js"));
      expect(files[2]).toBe(path.join(srcRoot, "package.json"));
    });
  });

  describe("changed method", () => {
    it("should pass none when no output exists", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      bs.src(src)
        .changed(dest)
        .peek((file) => {
          files.push(file.path);
        });
      await pEvent(bs.stream, "finish");
      expect(files.length).toBe(3);
    });
    it("should pass all files when no file changed", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      await bs.src(src).dest(dest).finish();
      await bs
        .src(src)
        .changed(dest)
        .peek((file) => {
          files.push(file.path);
        })
        .finish();
      expect(files.length).toBe(0);
    });
    it("should pass changed file only", async () => {
      const src = path.join(srcRoot, "**/*.*");
      const files: string[] = [];
      // generate output first
      await bs.src(src).dest(dest).sync();

      // wait for the stream to finish
      await timer(10);

      // change the script file and check if it is passed
      fs.writeFileSync(scriptFile, "console.log('now changed')");
      await bs
        .src(src)
        .changed(dest)
        .peek((file) => {
          files.push(file.path);
        })
        .finish();

      expect(files.length).toBe(1);
      expect(files[0]).toBe(scriptFile);
    });
    it("should return this unchanged when no dest is given or configured", () => {
      const noOptsBs = new BuildStream("no-dest");
      const result = noOptsBs.changed();
      expect(result).toBe(noOptsBs);
    });
  });

  describe("copy method", () => {
    it("should copy files from a glob to a destination directory", async () => {
      const copyDest = path.join(tmpDir, "copy-dest-glob");

      await bs.copy(path.join(srcRoot, "**/*.*"), copyDest).sync();

      expect(fs.existsSync(path.join(copyDest, "scripts/test.js"))).toBeTruthy();
      expect(fs.existsSync(path.join(copyDest, "styles/test.css"))).toBeTruthy();
      expect(fs.existsSync(path.join(copyDest, "package.json"))).toBeTruthy();
    });

    it("should copy multiple source/destination pairs and merge shared options into each param", async () => {
      const dest1 = path.join(tmpDir, "copy-dest-1");
      const dest2 = path.join(tmpDir, "copy-dest-2");
      const mockLogger = createMockLogger();

      // The shared opts (2nd arg) are copy-changed's own `defaultOptions`,
      // merged into every param — but a param's own `options` still wins
      // over that shared default (see the CopyOptions type comment above
      // BuildStream.copy()).
      await bs
        .copy(
          [
            { src: path.join(srcRoot, "scripts/**/*.js"), dest: dest1 },
            {
              src: path.join(srcRoot, "styles/**/*.css"),
              dest: dest2,
              options: { logLevel: "silent" },
            },
          ],
          { logger: mockLogger },
        )
        .sync();

      expect(fs.existsSync(path.join(dest1, "test.js"))).toBeTruthy();
      expect(fs.existsSync(path.join(dest2, "test.css"))).toBeTruthy();

      // dest1 has no param-level override, so it inherits the shared
      // logger/logLevel and logs its finish summary...
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("1 file(s) copied"));
      // ...while dest2's own `options.logLevel: "silent"` overrides the
      // shared default and suppresses its summary - proving param-level
      // options win over the shared ones rather than being ignored.
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it("should print a summary by default, and stay silent with logLevel: 'silent'", async () => {
      const mockLogger = createMockLogger();

      // copy() now has the exact same interface as copy-changed itself,
      // so its default logging behavior is copy-changed's own: a summary
      // is printed via onFinish unless logLevel is 'silent'.
      await bs
        .copy(path.join(srcRoot, "**/*.*"), path.join(tmpDir, "copy-dest-stats"), {
          logger: mockLogger,
        })
        .sync();
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("file(s) copied"));

      mockLogger.info.mockClear();

      await bs
        .copy(path.join(srcRoot, "**/*.*"), path.join(tmpDir, "copy-dest-quiet"), {
          logger: mockLogger,
          logLevel: "silent",
        })
        .sync();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should log the error and reject the promise queue when the copy fails", async () => {
      const mockLogger = createMockLogger();
      // pkgFile already exists as a plain file, so copying a glob (dynamic
      // pattern) onto it is rejected by copy-changed instead of silently
      // discarded, and BuildStream should propagate that failure.
      bs.copy(path.join(srcRoot, "**/*.js"), pkgFile, { logger: mockLogger });

      await expect(bs.sync()).rejects.toThrow();
      // opts.logger was passed explicitly, so it's used as-is (no
      // this.log() prefixing — that only applies to BuildStream's own
      // fallback logger).
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("copy failed"));
    });

    it("should stringify a non-Error rejection value", async () => {
      const { copyChangedAsync } = await import("copy-changed");
      vi.mocked(copyChangedAsync).mockRejectedValueOnce("plain string failure");
      const mockLogger = createMockLogger();
      bs.copy(path.join(srcRoot, "**/*.*"), path.join(tmpDir, "copy-dest-nonerror"), {
        logger: mockLogger,
      });

      await expect(bs.sync()).rejects.toBe("plain string failure");
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("copy failed - plain string failure"),
      );
    });
  });

  describe("del method", () => {
    it("should delete files in the stream", async () => {
      // generate output first
      await bs.src(path.join(srcRoot, "**/*.*")).dest(dest).finish();
      await timer(10); // wait for the stream to finish

      // delete one file from the generated files
      const targetFile = path.join(dest, "scripts/test.js");
      expect(fs.existsSync(targetFile)).toBeTruthy();
      bs.del(path.join(dest, "**/*.js"), { force: true });
      await bs.sync();
      // check if the file is deleted
      expect(fs.existsSync(targetFile)).toBeFalsy();

      const files: string[] = [];
      await bs
        .src(path.join(dest, "**/*.*"))
        .peek((file) => {
          files.push(file.path);
        })
        .finish();

      expect(files.length).toBe(2);
      expect(files).toContain(path.join(dest, "styles/test.css"));
      expect(files).toContain(path.join(dest, "package.json"));
    });
    it("should not log the deleting message when a silent logger is used", async () => {
      // del() has no logLevel gate of its own - `options.logLevel` in
      // DelOptions is only forwarded to the underlying deleteSync() glob
      // matching, not checked before the logger.info() call. The only way
      // to suppress the "deleting:[...]" line is to supply a logger that
      // itself stays quiet, e.g. getSilentLogger() from @wicle/tiny-logger
      // (the same mechanism clean() uses internally to silence del()).
      const named = new BuildStream("del-silent", { logger: getSilentLogger() });
      const { stdout, stderr } = await captureStdio(() => {
        named.del(path.join(dest, "**/*.does-not-exist"), { force: true });
      });

      expect(stdout).toBe("");
      expect(stderr).toBe("");
    });
  });

  describe("clean method", () => {
    it("should not log the cleaning message when a silent logger is used", async () => {
      // Same story as del(): clean()'s own "cleaning:[...]" line is logged
      // unconditionally via `(options.logger ?? this.logger).info(...)`,
      // with no logLevel check. Silence only comes from supplying a
      // logger that itself does nothing.
      const named = new BuildStream("clean-silent", { logger: getSilentLogger(), clean: dest });
      const mockDel = vi.spyOn(named, "del").mockReturnValue(named);

      const { stdout, stderr } = await captureStdio(() => {
        named.clean([]);
      });
      mockDel.mockRestore();

      expect(stdout).toBe("");
      expect(stderr).toBe("");
    });
    it("should call del method with collected list of clean targets", async () => {
      // create a new BuildStream instance with clean option
      bs = new BuildStream("clean-test", { clean: dest });

      const extraCleanList = ["./temp/**"];
      const mockDel = vi.spyOn(bs, "del").mockReturnValue(bs);
      bs.clean(extraCleanList);

      expect(mockDel).toHaveBeenCalledTimes(1);
      const [calledList, calledOptions] = mockDel.mock.calls[0];
      expect(calledList).toEqual([bs.opts.clean, ...extraCleanList]);
      // clean() silences del()'s own log by swapping in a getSilentLogger()
      // instance rather than passing a `logLevel` flag (del() doesn't
      // check logLevel at all) - so the logger handed to del() must differ
      // from the BuildStream's own configured logger.
      expect(calledOptions?.logger).toBeDefined();
      expect(calledOptions?.logger).not.toBe(bs.logger);
      mockDel.mockRestore();
    });
  });

  describe("exec method", () => {
    it("should execute a command successfully and resolve the promise queue", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("exec-test", { logger: mockLogger });

      const result = named.exec("echo hello-from-exec");
      expect(result).toBe(named);
      await expect(named.sync()).resolves.toBeUndefined();

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("hello-from-exec"));
    });

    it("should not log anything extra when the command produces no stdout", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("exec-test", { logger: mockLogger });

      named.exec("true");
      await expect(named.sync()).resolves.toBeUndefined();

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("exec: 'true'"));
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it("should log stdout (but no stderr call) when a failing command only produces stdout", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("exec-test", { logger: mockLogger });

      named.exec("node -e \"console.log('failing-stdout'); process.exit(1)\"");

      await expect(named.sync()).rejects.toThrow();
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("failing-stdout"));
    });

    it("should log the '--> done.' message when logLevel is verbose", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("exec-test", { logger: mockLogger, logLevel: "verbose" });

      named.exec("echo hi");
      await named.sync();

      // the '--> done.' message is emitted through logger.verbose(), not
      // logger.info() - BuildStream.exec() relies on the underlying
      // logger's own level filtering (this.#logger.level, set from
      // opts.logLevel in the constructor) rather than gating this call
      // itself, so a mock logger receives the call regardless of the
      // 'verbose' logLevel passed above; what we can assert here is that
      // it went to the right method.
      expect(mockLogger.verbose).toHaveBeenCalledWith(expect.stringContaining("--> done."));
    });

    it("should stay silent when logLevel is silent, using the real logger's level filtering", async () => {
      // BuildStream.exec() has no per-call logLevel gate of its own - it
      // always calls this.logger.info()/.verbose() and relies on the
      // logger instance's own level (this.#logger.level, set from
      // opts.logLevel in the BuildStream constructor) to actually
      // suppress output. A plain mock logger has no such filtering, so
      // this only demonstrates real suppression with the genuine
      // pino-backed default logger.
      const named = new BuildStream("exec-silent", { logLevel: "silent" });
      const { stdout, stderr } = await captureStdio(async () => {
        named.exec("echo hi");
        await named.sync();
      });

      expect(stdout).toBe("");
      expect(stderr).toBe("");
    });

    it("should reject and log stdout/stderr when the command fails", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("exec-test", { logger: mockLogger });

      named.exec("node -e \"console.error('boom'); process.exit(1)\"");

      await expect(named.sync()).rejects.toThrow();
      // both the 'failed to execute' summary and the captured stderr
      // ('boom') go through logger.error() in the error branch of
      // exec()'s callback - there is no stdout here, so logger.info()
      // is never called at all.
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("failed to execute"));
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("boom"));
    });
  });

  describe("dest method", () => {
    it("should call gulp.dest with bs.opts.dest", async () => {
      // create a new BuildStream instance with dest option and create a mock for gulp.dest
      bs = new BuildStream("test", { dest });
      const mockDest = vi
        .spyOn(gulp, "dest")
        .mockImplementation(() => new PassThrough({ objectMode: true }));

      await bs.src(path.join(srcRoot, "**/*.*")).dest().finish();

      expect(mockDest).toHaveBeenCalledWith(dest, { sourcemaps: undefined });

      mockDest.mockRestore();
    });
    it("should fall back to '.' when neither a folder argument nor opts.dest is given", async () => {
      const mockDest = vi
        .spyOn(gulp, "dest")
        .mockImplementation(() => new PassThrough({ objectMode: true }));

      await bs.src(path.join(srcRoot, "**/*.*")).dest().finish();

      expect(mockDest).toHaveBeenCalledWith(".", {});

      mockDest.mockRestore();
    });
  });

  describe("reload method", () => {
    it("should call browser-sync stream method", () => {
      bs.reload();
      expect(browserSync.stream).toHaveBeenCalledTimes(1);
    });
    it("should do nothing when browser-sync is not active", () => {
      const originalActive = browserSync.active;
      (browserSync as unknown as { active: boolean }).active = false;

      const result = bs.reload();

      expect(result).toBe(bs);
      expect(browserSync.stream).not.toHaveBeenCalled();
      (browserSync as unknown as { active: boolean }).active = originalActive;
    });
  });

  describe("clear method", () => {
    it("should clear the stream", async () => {
      const files: string[] = [];
      const filesAfterClear: string[] = [];
      await bs
        .src(path.join(srcRoot, "**/*.*"))
        .peek((file) => {
          files.push(file.path);
        })
        .clear()
        .peek((file) => {
          filesAfterClear.push(file.path);
        })
        .finish();

      expect(files.length).toBe(3);
      expect(filesAfterClear.length).toBe(0);
    });
  });

  describe("through method", () => {
    it("should pipe a transform stream that modifies files", async () => {
      const names: string[] = [];
      await bs
        .src(path.join(srcRoot, "**/*.*"))
        .through((file, _enc, cb) => {
          names.push(path.basename(file.path));
          cb(null, file);
        })
        .finish();

      expect(names).toEqual(expect.arrayContaining(["test.js", "test.css", "package.json"]));
    });
  });

  describe("intercept method", () => {
    it("should call the transform's callback explicitly with data", async () => {
      const names: string[] = [];
      await bs
        .src(path.join(srcRoot, "**/*.*"))
        .intercept((file, _enc, cb) => {
          names.push(path.basename(file.path));
          cb(undefined, file);
        })
        .finish();

      expect(names).toEqual(expect.arrayContaining(["test.js", "test.css", "package.json"]));
    });

    it("should call the flush callback explicitly on stream end", async () => {
      let finished = false;
      await bs
        .src(path.join(srcRoot, "**/*.*"))
        .intercept(undefined, (cb) => {
          finished = true;
          cb();
        })
        .finish();

      expect(finished).toBe(true);
    });
  });

  describe("detachStream method", () => {
    it("should detach the current stream and reset to a null stream", async () => {
      await bs.src(path.join(srcRoot, "**/*.*")).finish();
      const originalStream = bs.stream;

      const detached = bs.detachStream();

      expect(detached).toBe(originalStream);
      expect(bs.stream).not.toBe(originalStream);
      expect(bs.stream).toBeInstanceOf(PassThrough);
    });
  });

  describe("clone method", () => {
    it("should clone the BuildStream instance", async () => {
      const jsFiles: string[] = [];
      const cssFiles: string[] = [];

      const cssStream = bs.src(path.join(srcRoot, "**/*.*")).clone().filter("*.css");
      const jsStream = bs.filter("*.js");

      await jsStream
        .peek((file) => {
          jsFiles.push(file.path);
        })
        .finish();
      await cssStream
        .peek((file) => {
          cssFiles.push(file.path);
        })
        .finish();

      expect(jsFiles.length).toBe(1);
      expect(jsFiles).toContain(scriptFile);
      expect(cssFiles.length).toBe(1);
      expect(cssFiles).toContain(styleFile);
    });
  });

  describe("on method", () => {
    it("should handle stream events with on method", () => {
      const eventHandler = vi.fn();
      expect(bs.on("end", eventHandler)).toBe(bs);
      (bs.stream as NodeJS.ReadWriteStream).emit("end");
      expect(eventHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("promise method", () => {
    it("should process promises in sequence", async () => {
      const messages: string[] = [];

      // normal function
      const f1 = () => messages.push("f1");

      // async function with delay
      const f2 = async () => {
        await timer(10); // simulate async operation
        messages.push("f2");
      };

      // second normal function: should waitl until f2 is finished
      const f3 = () => messages.push("f3");

      await bs.promise(f1).promise(f2).promise(f3).sync();

      expect(messages.length).toBe(3);
      expect(messages[0]).toBe("f1");
      expect(messages[1]).toBe("f2");
      expect(messages[2]).toBe("f3");
    });
  });

  describe("chain methods", () => {
    it("should execute function with this BuildStream as first argument and return BuildStream", () => {
      const fn = vi.fn(() => bs);
      const result = bs.chain(fn);
      expect(result).toBe(bs);
      expect(fn).toHaveBeenCalledWith(bs);
    });
  });

  describe("pipe method", () => {
    it("should pipe another stream to current build stream", async () => {
      const messages: string[] = [];
      const plugin = throughSafe(undefined, (_cb) => {
        messages.push("plugin called");
      });
      await bs.src(path.join(srcRoot, "**/*.*")).pipe(plugin).finish();
      expect(messages.length).toBe(1);
      expect(messages[0]).toBe("plugin called");
    });
  });

  describe("debug method", () => {
    it("should log debug messages", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("test-stream", { logger: mockLogger });

      await named.src(scriptFile).debug("debug message").finish();

      // opts.logger (mockLogger) is used as-is here too, via this.log() —
      // no `[name]` prefix is forced on a caller-supplied logger.
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("debug message"));
    });
    it("should accept a DebugOptions object instead of a title string", async () => {
      const mockLogger = createMockLogger();
      const named = new BuildStream("test-stream", { logger: mockLogger });

      await named.src(scriptFile).debug({ title: "custom:" }).finish();

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("custom:"));
    });
  });
});
