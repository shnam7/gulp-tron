import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ExecOptions, type ExecResult, exec } from "../../src/utils/exec.js";

const execSuccess: ExecResult = { exitCode: 0, message: "" };

describe("Exec Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exec function", () => {
    it("should not throw error but return result obkect", async () => {
      await expect(exec("")).resolves.toStrictEqual({
        message: "Invalid command: ''",
      });
      await expect(exec("  ")).resolves.toStrictEqual({
        message: "Invalid command: '  '",
      });
    });

    it("should execute valid command", async () => {
      await expect(exec("echo test")).resolves.toStrictEqual(execSuccess);
    });

    it("should accept execution options", async () => {
      const options: ExecOptions = {
        cwd: process.cwd(),
        logLevel: "silent",
      };
      await expect(exec("echo test", options)).resolves.toStrictEqual(execSuccess);
    });

    it("should handle command failure", async () => {
      await expect(exec("false")).resolves.toStrictEqual({
        exitCode: 1,
        message: 'Command "false" exited with code: 1',
      });
    });

    it("should handle a spawn error (e.g. invalid cwd)", async () => {
      const result = await exec("echo test", { cwd: "/definitely/does/not/exist/xyz" });
      expect(result.exitCode).toBeUndefined();
      expect(result.message).toContain('Failed to execute "echo test"');
    });
  });
});
