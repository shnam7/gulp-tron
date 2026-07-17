import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import copy, { type CopyParam, copyFile, copyGlob, copyParam } from "../../src/utils/copy.js";

// Secure test isolation using process ID to prevent conflicts in parallel test environments
const tmpDir = path.join(os.tmpdir(), `copy-util-test-${process.pid}`);
const srcDir = path.join(tmpDir, "src");
const srcSubDir = path.join(srcDir, "sub");
const destDir = path.join(tmpDir, "dest");
const destSubDir = path.join(destDir, "sub");
const fileA = path.join(srcDir, "a.txt");
const fileB = path.join(srcDir, "b.txt");
const fileC = path.join(srcSubDir, "c.txt");

/**
 * Utility to convert Windows backslashes to forward slashes for reliable glob matching
 */
function toPosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

function setupFiles() {
  fs.mkdirSync(srcSubDir, { recursive: true });
  fs.writeFileSync(fileA, "hello");
  fs.writeFileSync(fileB, "world");
  fs.writeFileSync(fileC, "sub");
}

function cleanup() {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

function cleanupDest() {
  try {
    fs.rmSync(destDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

describe("Copy Utility", () => {
  beforeEach(() => {
    cleanup();
    setupFiles();
  });

  afterEach(() => {
    cleanup();
  });

  describe("copyFile", () => {
    it("should copy a single file", () => {
      const result = copyFile(fileA, destDir, {});
      expect(result.copied).toBe(1);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
    });

    it("should skip up-to-date file", () => {
      copyFile(fileA, destDir, {});
      const result = copyFile(fileA, destDir, {});
      expect(result.skipped).toBe(1);
    });

    it("should not skip when force option is given even if up-to-date", () => {
      copyFile(fileA, destDir, {});
      const result = copyFile(fileA, destDir, { force: true });
      expect(result.copied).toBe(1);
    });

    it("should not actually copy when dryRun option is given", () => {
      cleanupDest();
      const result = copyFile(fileA, destDir, { dryRun: true });
      expect(result.copied).toBe(1);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(false);
    });

    it("should return error for missing source file", () => {
      const result = copyFile(path.join(srcDir, "notfound.txt"), destDir);
      expect(result.errors).toBe(1);
      // Fixed: Replaced unsupported /v regex flag with standard /i flag
      expect(result.message).toMatch(/does not exist/i);
    });
  });

  describe("copyGlob", () => {
    beforeEach(() => {
      cleanupDest();
    });

    it("should copy files using glob string", () => {
      // Fixed: Cross-platform slash normalization for glob pattern
      const src = toPosixPath(path.join(srcDir, "{a,b}.txt"));
      const result = copyGlob(src, destDir, {});
      expect(result.copied).toBe(2);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destDir, "b.txt"))).toBe(true);
    });

    it("should copy files using glob string array", () => {
      // Fixed: Cross-platform slash normalization for glob pattern
      const src = [toPosixPath(path.join(srcDir, "{a,b}.txt"))];
      const result = copyGlob(src, destDir, {});
      expect(result.copied).toBe(2);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destDir, "b.txt"))).toBe(true);
    });

    it("should preserve directory structure when copying files using glob", () => {
      // Fixed: Cross-platform slash normalization for glob pattern
      const src = [toPosixPath(path.join(srcDir, "**/c.txt"))];
      const result = copyGlob(src, destDir, { logLevel: "verbose" });
      expect(result.copied).toBe(1);
      expect(fs.existsSync(path.join(destSubDir, "c.txt"))).toBe(true);
    });
  });

  describe("copyParam", () => {
    it("should copy files using CopyParam array", () => {
      const params: CopyParam[] = [
        { src: fileA, dest: destDir },
        { src: fileB, dest: destDir },
      ];
      const result = copyParam(params, {});
      expect(result.copied).toBe(2);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destDir, "b.txt"))).toBe(true);
    });
  });

  describe("copy", () => {
    it("should copy single file", () => {
      const result = copy(fileA, destDir);
      expect(result.copied).toBe(1);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
    });

    it("should copy using glob file pattern", () => {
      // Fixed: Cross-platform slash normalization for glob pattern
      const src = toPosixPath(path.join(srcDir, "*.txt"));
      const result = copy(src, destDir);
      expect(result.copied).toBe(2);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destDir, "b.txt"))).toBe(true);
    });

    it("should copy using CopyParam containing recursive pattern", () => {
      // Fixed: Changed '**' to '**/*.txt' to ensure deterministic file counting across platforms
      const srcPattern = toPosixPath(path.join(srcDir, "**/*.txt"));
      const params: CopyParam = { src: srcPattern, dest: destDir };
      const result = copy(params);
      expect(result.copied).toBe(3);
      expect(fs.existsSync(path.join(destDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destDir, "b.txt"))).toBe(true);
      expect(fs.existsSync(path.join(destSubDir, "c.txt"))).toBe(true);
    });
  });
});
