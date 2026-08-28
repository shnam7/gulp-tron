import { vi } from "vitest";

/**
 * Captures everything written to process.stdout/stderr while `fn` runs,
 * always restoring the real streams afterward (even if `fn` throws).
 * Used to verify real (non-mocked) suppression/formatting behavior that a
 * plain mock logger can't demonstrate, e.g. a genuinely silent logger or
 * the default logger's `[name]` prefix.
 */
export async function captureStdio(fn: () => void | Promise<void>) {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    stdoutChunks.push(String(chunk));
    return true;
  });
  const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation((chunk: unknown) => {
    stderrChunks.push(String(chunk));
    return true;
  });

  try {
    await fn();
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  }

  return { stdout: stdoutChunks.join(""), stderr: stderrChunks.join("") };
}
