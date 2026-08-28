import browserSync from "browser-sync";
import gulp from "gulp";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { BuildStream } from "../src/build-stream.js";
import { Tron } from "../src/tron.js";
import type { BuildFunction, BuildOptions, TaskConfig } from "../src/types.js";
import { createMockLogger, execTask, makeFakeWatcher } from "./helpers/index.js";

describe("Tron", () => {
  let tron: Tron;
  beforeEach(() => {
    tron = new Tron();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("task method", () => {
    it("should create a task with a string name and build function", async () => {
      const taskName = "task1";
      let bsOptions: BuildOptions = {} as BuildOptions;
      const buildFunction = (bs: BuildStream) => {
        expect(bs).toBeInstanceOf(BuildStream);
        expect(bs.name).toBe(taskName);
        bsOptions = bs.opts;
      };

      expect(tron.taskCount).toBe(0);
      const result = tron.task(taskName, buildFunction as BuildFunction);
      expect(tron.taskCount).toBe(1);

      const taskWrapper = gulp.task(taskName);
      const mainFunc = gulp.task(taskName)?.unwrap();
      expect(result).toBe(tron);
      expect(tron.findTask(taskName)).toBeDefined();
      expect(taskWrapper).toBeDefined();
      expect(mainFunc).toBeDefined();
      expect(mainFunc?.name).toBe("main");
      await expect(execTask(taskName)).resolves.not.toThrow();
      expect(bsOptions).toEqual({ name: taskName, build: buildFunction });
    });
    it("should create a task with a configuration object", async () => {
      let bsOptions: BuildOptions = {};
      const config = {
        name: "task1",
        build(bs: BuildStream) {
          expect(bs).toBeInstanceOf(BuildStream);
          expect(bs.name).toBe(config.name);
          bsOptions = bs.opts;
        },
      } as TaskConfig;

      expect(tron.taskCount).toBe(0);
      tron.task(config);
      expect(tron.taskCount).toBe(1);
      expect(tron.findTask(config.name)).toBeDefined();

      await expect(execTask(config.name)).resolves.not.toThrow();
      expect(bsOptions).toEqual(config);
    });
    it("should create a task without a build function", async () => {
      const taskName = "task1";

      expect(tron.taskCount).toBe(0);
      tron.task(taskName);
      expect(tron.taskCount).toBe(1);
      expect(tron.findTask(taskName)).toBeDefined();

      await expect(execTask(taskName)).resolves.not.toThrow();
    });
    it("should throw an error for invalid task names", () => {
      expect(() => tron.task("")).toThrow("Tron:task: invalid task name");
      expect(() => tron.task("invalid/name")).toThrow("Tron:task: invalid task name");
      expect(() => tron.task({ name: String.raw`invalid\name` })).toThrow(
        "Tron:task: invalid task name",
      );
    });
    it("should throw an error for reserved task names", () => {
      expect(() => tron.task("@clean", () => {})).toThrow(
        "Tron:resolveTaskConfig: invalid task name: '@clean' is a reserved task name.",
      );
      expect(() => tron.task("@watch", () => {})).toThrow(
        "Tron:resolveTaskConfig: invalid task name: '@watch' is a reserved task name.",
      );
    });
    it("should handle duplicate task names without throwing", async () => {
      const taskName = "task1";
      const messages: string[] = [];

      expect(tron.taskCount).toBe(0);
      tron.task(taskName, () => {
        messages.push("first run");
      });
      await expect(execTask(taskName)).resolves.not.toThrow();
      expect(messages.length).toBe(1);
      expect(messages[0]).toBe("first run");

      // Create duplicate task
      expect(tron.taskCount).toBe(1);
      tron.task(taskName, () => {
        messages.push("second run");
      });
      expect(tron.taskCount).toBe(1);
      await expect(execTask(taskName)).resolves.not.toThrow();
      expect(messages.length).toBe(2);
      expect(messages[1]).toBe("second run");
    });
    it("should handle task dependencies and triggers", async () => {
      const mockSeries = vi.spyOn(gulp, "series").mockImplementation((...args) => {
        for (const task of args) if (typeof task === "function") task(() => {});
        return () => {};
      });

      const taskNames: string[] = [];
      const build: BuildFunction = (bs: BuildStream) => {
        taskNames.push(bs.name);
      };

      expect(tron.taskCount).toBe(0);
      tron.task("depTask", build);
      tron.task("trigTask", build);
      tron.task({ name: "mainTask", build, dependsOn: "depTask", triggers: "trigTask" });
      expect(tron.taskCount).toBe(3);

      expect(taskNames).toEqual(expect.arrayContaining(["depTask", "mainTask", "trigTask"]));

      mockSeries.mockRestore();
    });
    it("should handle series, parallel, and complex dependencies", () => {
      const mockSeries = vi.spyOn(gulp, "series");
      const mockParallel = vi.spyOn(gulp, "parallel");

      const taskNames: string[] = [];
      const build: BuildFunction = (bs: BuildStream) => {
        taskNames.push(bs.name);
      };
      expect(tron.taskCount).toBe(0);
      tron.task("t-dep-s1", build);
      tron.task("t-dep-s2", build);
      tron.task("t-trig-p1", build);
      tron.task("t-trig-p2", build);
      const dependsOn = tron.series("t-dep-s1", "t-dep-s2");
      const triggers = tron.parallel("t-trig-p1", "t-trig-p2");
      tron.task({ name: "mainTask", build, dependsOn, triggers });
      expect(tron.taskCount).toBe(5);

      expect(mockSeries).toHaveBeenCalledTimes(2);
      expect(mockParallel).toHaveBeenCalledTimes(1);

      mockSeries.mockRestore();
      mockParallel.mockRestore();
    });

    it("should handle edge cases for dependsOn and triggers", () => {
      const build: BuildFunction = () => {};
      // Empty buildSets
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "empty-dependencies", build, dependsOn: [], triggers: [] });
      expect(tron.taskCount).toBe(1);
      expect(tron.findTask("empty-dependencies")).toBeDefined();

      // Only dependencies
      tron.task("dependsOn-only", () => {});
      tron.task({ name: "no-build-with-deps", dependsOn: "dependsOn-only" });
      expect(tron.taskCount).toBe(3);
      expect(tron.findTask("no-build-with-deps")).toBeDefined();
    });
  });

  describe("createTasks method", () => {
    it("should create multiple tasks from an array of configurations", async () => {
      const taskConfigs: TaskConfig[] = [
        {
          name: "task1",
          build(bs: BuildStream) {
            expect(bs.opts).toStrictEqual(taskConfigs[0]);
          },
        },
        {
          name: "task2",
          build(bs: BuildStream) {
            expect(bs.opts).toStrictEqual(taskConfigs[1]);
          },
        },
      ];

      expect(tron.taskCount).toBe(0);
      tron.createTasks(...taskConfigs);
      expect(tron.taskCount).toBe(2);

      await expect(execTask("task1")).resolves.not.toThrow();
      await expect(execTask("task2")).resolves.not.toThrow();
    });
    it("should handle empty configurations gracefully", () => {
      expect(() => tron.createTasks()).not.toThrow();
      expect(tron.selectTasksAll().length).toBe(0);
    });
    it("should handle single TaskConfig object", async () => {
      const taskConfig = { name: "task1" };
      tron.createTasks(taskConfig);
      await expect(execTask(taskConfig.name)).resolves.not.toThrow();
    });
  });

  describe("addCleaner method", () => {
    let mockDel: MockInstance<typeof BuildStream.prototype.del>;

    beforeEach(() => {
      mockDel = vi.spyOn(BuildStream.prototype, "del");
    });
    afterEach(() => {
      mockDel.mockRestore();
    });

    it("should add a cleaner task", async () => {
      expect(tron.taskCount).toBe(0);
      tron.addCleaner({ clean: ["dist"] });
      expect(tron.taskCount).toBe(1);

      await expect(execTask("@clean")).resolves.not.toThrow();
      expect(mockDel).toHaveBeenCalledWith(["dist"], expect.any(Object));
    });
    it("should handle clean targets correctly", async () => {
      const conf1 = { name: "task1", clean: ["dist1"] };
      const conf2 = { name: "task2", clean: ["dist2"] };

      expect(tron.taskCount).toBe(0);
      tron.task(conf1);
      tron.task(conf2);
      tron.addCleaner({ clean: ["dist3"] });
      expect(tron.taskCount).toBe(3);

      await expect(execTask("@clean")).resolves.not.toThrow();
      expect(mockDel).toHaveBeenCalledWith(["dist3", "dist1", "dist2"], expect.any(Object));
    });
  });

  describe("addWatch method", () => {
    let mockWatch: MockInstance<typeof gulp.watch>;
    let mockBrowserSync: MockInstance<typeof browserSync.init>;
    beforeEach(() => {
      mockWatch = vi.spyOn(gulp, "watch");
      mockBrowserSync = vi.spyOn(browserSync, "init").mockImplementation(() => {
        return {} as unknown as browserSync.BrowserSyncInstance;
      });
    });
    afterEach(() => {
      mockWatch.mockRestore();
      mockBrowserSync.mockRestore();
    });

    it("should add a watcher for src pattern", async () => {
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "src-task", src: "src/**/*.js" });
      tron.addWatcher();
      expect(tron.taskCount).toBe(2);
      expect(tron.findTask("@watch")).toBeDefined();

      await expect(execTask("@watch")).resolves.not.toThrow();
      expect(mockWatch).toHaveBeenCalledWith(["src/**/*.js"], expect.any(Function));
    });
    it("should handle no matching targets", async () => {
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "task1", src: "src/**/*.js" });
      tron.addWatcher({ target: "non-existent-*" });
      expect(tron.taskCount).toBe(2);

      await expect(execTask("@watch")).resolves.not.toThrow();
      expect(mockWatch).not.toHaveBeenCalled();
    });

    it("should add a watcher with custom name for watch pattern", async () => {
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "watch-task", watch: "src/**/*.ts" });
      tron.addWatcher({ name: "watch-ts" });
      expect(tron.taskCount).toBe(2);
      expect(tron.findTask("watch-ts")).toBeDefined();

      await expect(execTask("watch-ts")).resolves.not.toThrow();
      expect(mockWatch).toHaveBeenCalledWith(["src/**/*.ts"], expect.any(Function));
    });

    it("should add a watcher for addWatch pattern", async () => {
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "addwatch-task", addWatch: "src/**/*.css" });
      tron.addWatcher();
      expect(tron.taskCount).toBe(2);

      await expect(execTask("@watch")).resolves.not.toThrow();
      expect(mockWatch).toHaveBeenCalledWith(["src/**/*.css"], expect.any(Function));
    });

    it("should initialize browserSync if option is set", async () => {
      expect(tron.taskCount).toBe(0);
      tron.task({ name: "bs-task", src: "src/**/*.js", build() {} });
      tron.addWatcher({ browserSync: { server: "public" } });
      expect(tron.taskCount).toBe(2);

      await expect(execTask("@watch")).resolves.not.toThrow();
      expect(mockBrowserSync).toHaveBeenCalledWith(expect.objectContaining({ server: "public" }));
    });

    it("should log a message when a watched file changes", async () => {
      const fakeWatcher = makeFakeWatcher();
      mockWatch.mockReturnValue(fakeWatcher as unknown as ReturnType<typeof gulp.watch>);
      const mockLogger = createMockLogger();

      tron.task({ name: "change-task", src: "src/**/*.js" });
      // The change handler logs via `bs.logger.info(...)`, where `bs` is
      // the @watch task's own BuildStream instance - so the logger to
      // observe is the one passed to addWatcher() (the @watch task's own
      // options), not the watched task's logger.
      tron.addWatcher({ logger: mockLogger });
      await execTask("@watch");

      fakeWatcher.emit("change", "src/a.js");

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("change detected:'src/a.js"),
      );
    });

    it("should not log a change message when the task's logLevel is silent", async () => {
      const fakeWatcher = makeFakeWatcher();
      mockWatch.mockReturnValue(fakeWatcher as unknown as ReturnType<typeof gulp.watch>);
      const logSpy = vi.spyOn(BuildStream.prototype, "log");

      tron.task({ name: "silent-change-task", src: "src/**/*.js", logLevel: "silent" });
      tron.addWatcher();
      await execTask("@watch");
      logSpy.mockClear();

      fakeWatcher.emit("change", "src/a.js");

      expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("change detected"));
      logSpy.mockRestore();
    });

    it("should reload browserSync when a watched file changes and browserSync is enabled", async () => {
      const fakeWatcher = makeFakeWatcher();
      mockWatch.mockReturnValue(fakeWatcher as unknown as ReturnType<typeof gulp.watch>);
      const reloadSpy = vi.spyOn(browserSync, "reload").mockImplementation(() => {});

      tron.task({ name: "bs-change-task", src: "src/**/*.js" });
      tron.addWatcher({ browserSync: { server: "public" } });
      await execTask("@watch");

      fakeWatcher.emit("change", "src/a.js");

      expect(reloadSpy).toHaveBeenCalledTimes(1);
      reloadSpy.mockRestore();
    });

    it("should not set up watchers again if the watcher body already ran", async () => {
      tron.task({ name: "double-run-task", src: "src/**/*.js" });
      tron.addWatcher();

      await execTask("@watch");
      expect(mockWatch).toHaveBeenCalledTimes(1);

      // Invoking the same registered @watch task a second time should hit
      // the `isWatching` guard and return immediately, without watching again.
      await execTask("@watch");
      expect(mockWatch).toHaveBeenCalledTimes(1);
    });

    it("should skip a target task that has nothing to watch", async () => {
      tron.task({ name: "nothing-to-watch-task" });
      tron.addWatcher();

      await expect(execTask("@watch")).resolves.not.toThrow();
      expect(mockWatch).not.toHaveBeenCalled();
    });
  });

  describe("_resolveBuildSet edge cases", () => {
    it("should throw when a dependsOn/triggers task name is not registered", () => {
      expect(() =>
        tron.task({ name: "mainTask-missing-dep", dependsOn: "does-not-exist" }),
      ).toThrow(/is not found/);
    });

    it("should wrap a named raw BuildFunction passed as triggers into an anonymous task", async () => {
      const calls: string[] = [];
      function myRawBuildFn(bs: BuildStream) {
        calls.push(bs.name);
      }
      tron.task({
        name: "mainTask-raw-fn",
        build: () => {},
        triggers: myRawBuildFn as BuildFunction,
      });

      await expect(execTask("mainTask-raw-fn")).resolves.not.toThrow();
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatch(/^tron-anonymous#\d+-myRawBuildFn$/);
    });

    it("should name a nameless raw BuildFunction 'buildFunc' in its anonymous task name", async () => {
      const calls: string[] = [];
      // An array element gets no name inference (unlike an object property),
      // so this function's .name is "".
      const anonymousFns = [
        (bs: BuildStream) => {
          calls.push(bs.name);
        },
      ];
      tron.task({
        name: "mainTask-anon-fn",
        build: () => {},
        dependsOn: anonymousFns as unknown as BuildFunction,
      });

      await expect(execTask("mainTask-anon-fn")).resolves.not.toThrow();
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatch(/^tron-anonymous#\d+-buildFunc$/);
    });

    it("should strip redundant nested arrays in a series buildSet", async () => {
      const calls: string[] = [];
      const build: BuildFunction = (bs) => {
        calls.push(bs.name);
      };
      tron.task("nested-s1", build);
      tron.task({ name: "nested-series-main", build, dependsOn: [["nested-s1"]] });

      await expect(execTask("nested-series-main")).resolves.not.toThrow();
      expect(calls).toEqual(expect.arrayContaining(["nested-s1", "nested-series-main"]));
    });

    it("should strip redundant nested arrays in a parallel buildSet", async () => {
      const calls: string[] = [];
      const build: BuildFunction = (bs) => {
        calls.push(bs.name);
      };
      tron.task("nested-p1", build);
      tron.task("nested-p2", build);
      tron.task({
        name: "nested-parallel-main",
        build,
        triggers: { set: [["nested-p1", "nested-p2"]] },
      });

      await expect(execTask("nested-parallel-main")).resolves.not.toThrow();
      expect(calls).toEqual(
        expect.arrayContaining(["nested-p1", "nested-p2", "nested-parallel-main"]),
      );
    });

    it("should throw for a completely unknown buildSet type", () => {
      expect(() =>
        tron.task({ name: "bad-buildset-task", dependsOn: 42 as unknown as BuildFunction }),
      ).toThrow(/Unknown type of buildSet/);
    });

    it("should accept a raw TaskConfig object (without 'set') as dependsOn", async () => {
      const calls: string[] = [];
      const build: BuildFunction = (bs) => {
        calls.push(bs.name);
      };
      tron.task({
        name: "mainTask-inline-taskconfig",
        build,
        dependsOn: { name: "inline-dep-task", build } as TaskConfig,
      });

      await expect(execTask("mainTask-inline-taskconfig")).resolves.not.toThrow();
      expect(calls).toEqual(
        expect.arrayContaining(["inline-dep-task", "mainTask-inline-taskconfig"]),
      );
    });

    it("should not throw when a parallel set resolves to no tasks at all", () => {
      expect(() =>
        tron.task({ name: "mainTask-empty-parallel", triggers: { set: [] } }),
      ).not.toThrow();
    });

    it("should use a single task directly (no gulp.parallel wrapper) for a single-item parallel set", async () => {
      const calls: string[] = [];
      const build: BuildFunction = (bs) => {
        calls.push(bs.name);
      };
      tron.task("single-p-task", build);
      tron.task({
        name: "mainTask-single-parallel",
        build,
        triggers: { set: ["single-p-task"] },
      });

      await expect(execTask("mainTask-single-parallel")).resolves.not.toThrow();
      expect(calls).toEqual(expect.arrayContaining(["single-p-task", "mainTask-single-parallel"]));
    });

    it("should throw when a nested TaskConfig has an empty name", () => {
      expect(() =>
        tron.task({
          name: "mainTask-empty-nested-name",
          dependsOn: { name: "", build: () => {} } as TaskConfig,
        }),
      ).toThrow(/invalid task name/);
    });
  });

  describe("findTask method", () => {
    it("should return undefined when called with no name", () => {
      expect(tron.findTask()).toBeUndefined();
      expect(tron.findTask(undefined)).toBeUndefined();
    });
  });

  describe("selectTasks method", () => {
    beforeEach(() => {
      tron.task("alpha");
      tron.task("beta");
      tron.task("gamma");
      tron.task("delta");
    });

    it("should return all tasks for * pattern", () => {
      const result = tron.selectTasks("*");
      expect(result.toSorted()).toEqual(["alpha", "beta", "gamma", "delta"].toSorted());
    });
    it("should return matching tasks for prefix pattern", () => {
      expect(tron.taskCount).toBe(4);
      expect(tron.selectTasks("a*")).toEqual(["alpha"]);
      expect(tron.selectTasks("b*")).toEqual(["beta"]);
    });
    it("should return matching tasks for array of patterns", () => {
      const result = tron.selectTasks(["a*", "g*"]);
      expect(result.toSorted()).toEqual(["alpha", "gamma"].toSorted());
    });
    it("should return empty array for no match", () => {
      expect(tron.selectTasks("zzz")).toEqual([]);
    });
    it("should support negation pattern", () => {
      const result = tron.selectTasks(["!beta"]);
      expect(result.toSorted()).toEqual(["alpha", "gamma", "delta"].toSorted());
    });
    it("should support multiple negation patterns", () => {
      let result = tron.selectTasks(["a*", "g*", "d*", "!g*"]);
      expect(result.toSorted()).toEqual(["alpha", "delta"].toSorted());

      // case starting with negation
      result = tron.selectTasks(["!g*", "a*", "d*"]);
      expect(result.toSorted()).toEqual(["alpha", "delta"].toSorted());
    });
    it("should support negation only patterns (all except)", () => {
      const result = tron.selectTasks(["!alpha", "!delta"]);
      expect(result.toSorted()).toEqual(["beta", "gamma"].toSorted());
    });

    it("should return empty array for undefined or empty input", () => {
      expect(tron.selectTasks()).toEqual([]);
      expect(tron.selectTasks(undefined)).toEqual([]);
    });

    it("should return empty array for empty array input", () => {
      expect(tron.selectTasks([])).toEqual([]);
    });
  });

  describe("series and parallel methods", () => {
    it("should create a series task with multiple functions", () => {
      const seriesTasks = tron.series("task1", "task2");
      expect(seriesTasks).toStrictEqual(expect.arrayContaining(["task1", "task2"]));
      const parallelTasks = tron.parallel("task1", "task2");
      expect(parallelTasks).toStrictEqual(expect.objectContaining({ set: ["task1", "task2"] }));
    });
  });
});
