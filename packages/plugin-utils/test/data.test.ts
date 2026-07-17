import fs from "node:fs";
import fg from "fast-glob";
import dataG from "gulp-data";
import type { BuildStream, PluginFunction } from "gulp-tron";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DataFunction, dataP, type Globs, loadData } from "../src/index.ts"; // Replace with your actual file path

// 1. Mock external dependencies
vi.mock("node:fs");
vi.mock("fast-glob");
vi.mock("gulp-data", () => ({
  default: vi.fn(
    (fn: unknown) => `mocked-gulp-data-stream(${typeof fn === "function" ? "function" : "object"})`,
  ),
}));

describe("loadData function tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should parse YAML files and merge them into an object keyed by the filename", () => {
    // Given
    vi.mocked(fg.globSync).mockReturnValue(["src/data/user.yml"]);
    vi.mocked(fs.readFileSync).mockReturnValue("name: John\nage: 30");

    // When
    const result = loadData("src/data/*.yml");

    // Then
    expect(result).toEqual({
      user: { name: "John", age: 30 },
    });
    expect(fs.readFileSync).toHaveBeenCalledWith("src/data/user.yml", "utf8");
  });

  it("should parse JSON files and merge them into an object keyed by the filename", () => {
    // Given
    vi.mocked(fg.globSync).mockReturnValue(["src/data/config.json"]);
    vi.mocked(fs.readFileSync).mockReturnValue('{"debug": true, "version": "1.0.0"}');

    // When
    const result = loadData("src/data/*.json");

    // Then
    expect(result).toEqual({
      config: { debug: true, version: "1.0.0" },
    });
  });

  it("should log a warning message when encountering an unsupported file extension", () => {
    // Given
    vi.mocked(fg.globSync).mockReturnValue(["src/data/readme.txt"]);
    const mockLogger = vi.fn();

    // When
    const result = loadData("src/data/*.txt", { logger: mockLogger });

    // Then
    expect(result).toEqual({}); // Should return an empty object
    expect(mockLogger).toHaveBeenCalledWith(
      expect.stringContaining("loadData: skipping unsupported file type: src/data/readme.txt"),
    );
  });

  it("should log data details when logLevel is set to 'verbose'", () => {
    // Given
    vi.mocked(fg.globSync).mockReturnValue(["src/data/info.json"]);
    vi.mocked(fs.readFileSync).mockReturnValue('{"status": "ok"}');
    const mockLogger = vi.fn();

    // When
    loadData("src/data/*.json", { logLevel: "verbose", logger: mockLogger });

    // Then
    expect(mockLogger).toHaveBeenCalledWith("loadData:src/data/*.json:", {
      info: { status: "ok" },
    });
  });
});

describe("dataP plugin function tests", () => {
  let mockBuildStream: BuildStream;

  beforeEach(() => {
    vi.resetAllMocks();

    // Recreate the strict mock structure for gulp-tron's BuildStream without using 'any'
    mockBuildStream = {
      opts: { logLevel: "info" },
      logger: vi.fn() as unknown as BuildStream["logger"],
      pipe: vi.fn((stream: unknown) => stream) as unknown as BuildStream["pipe"],
    } as unknown as BuildStream;
  });

  it("should load data and pass it to gulp-data when given a glob pattern string or array", () => {
    // Given
    const patterns: Globs = "src/data/*.json";
    vi.mocked(fg.globSync).mockReturnValue(["src/data/app.json"]);
    vi.mocked(fs.readFileSync).mockReturnValue('{"name": "my-app"}');

    // When
    const plugin: PluginFunction = dataP(patterns);
    plugin(mockBuildStream);

    // Then
    // Verify gulp-data (dataG) was called with the correctly parsed data object
    expect(dataG).toHaveBeenCalledWith({
      app: { name: "my-app" },
    });
    expect(mockBuildStream.pipe).toHaveBeenCalled();
  });

  it("should pass the function directly to gulp-data without parsing when given a DataFunction", () => {
    // Given
    const mockDataFunc: DataFunction = (
      _file: unknown,
      cb: (err: unknown, data: unknown) => void,
    ) => cb(null, { dynamic: "data" });

    // When
    const plugin: PluginFunction = dataP(mockDataFunc);
    plugin(mockBuildStream);

    // Then
    // Verify gulp-data (dataG) received the custom function instead of a data object
    expect(dataG).toHaveBeenCalledWith(mockDataFunc);
    expect(mockBuildStream.pipe).toHaveBeenCalled();
  });
});
