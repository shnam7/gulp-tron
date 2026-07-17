import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";

describe("core index exports", () => {
  it("should export Tron class", () => {
    expect(core.Tron).toBeDefined();
    expect(core.Tron.prototype).toBeDefined();
    expect(core.Tron.prototype.constructor).toBe(core.Tron);
  });
  it("should export series and parallel", () => {
    expect(core).toHaveProperty("series");
    expect(core).toHaveProperty("parallel");
  });
  it("should export BuildStream class", () => {
    expect(core.BuildStream).toBeDefined();
    expect(core.BuildStream.prototype).toBeDefined();
    expect(core.BuildStream.prototype.constructor).toBe(core.BuildStream);
  });
  it("should export utils", () => {
    expect(core).toHaveProperty("arrayify");
    expect(core).toHaveProperty("copy");
    expect(core).toHaveProperty("exec");
    expect(core).toHaveProperty("is");
  });
  it("should export gulp", () => {
    expect(core.gulp).toBeDefined();
  });
  it("should export tron instance as default", () => {
    expect(core.tron).toBeDefined();
    expect(core.default).toBe(core.tron);
  });
});
