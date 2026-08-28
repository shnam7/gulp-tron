import { vi } from "vitest";

/** A minimal mock satisfying ts-log's `Logger` interface, for asserting on calls directly. */
export const createMockLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  verbose: vi.fn(),
  fatal: vi.fn(),
});
