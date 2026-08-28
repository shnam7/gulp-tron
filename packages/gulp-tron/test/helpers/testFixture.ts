import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Creates a throwaway directory tree under the OS tmpdir with a small,
 * fixed set of source files (`scripts/test.js`, `styles/test.css`,
 * `package.json`) for tests that need real files on disk. Call `setup()`
 * in `beforeEach` and `cleanup()` in `afterEach`.
 */
export function createTestFixture(dirName: string) {
  const tmpDir = path.join(os.tmpdir(), dirName);
  const srcRoot = path.join(tmpDir, "src");
  const dest = path.join(tmpDir, "dist");
  const scriptFile = path.join(srcRoot, "scripts", "test.js");
  const styleFile = path.join(srcRoot, "styles", "test.css");
  const pkgFile = path.join(srcRoot, "package.json");

  function setup() {
    fs.mkdirSync(path.dirname(scriptFile), { recursive: true });
    fs.mkdirSync(path.dirname(styleFile), { recursive: true });
    fs.writeFileSync(scriptFile, "console.log('hello')");
    fs.writeFileSync(styleFile, "body { color: blue; }");
    fs.writeFileSync(pkgFile, '{"name":"test"}');
    if (!fs.existsSync(scriptFile) || !fs.existsSync(styleFile) || !fs.existsSync(pkgFile)) {
      throw new Error("Test files not created");
    }
  }

  function cleanup() {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }

  return { tmpDir, srcRoot, dest, scriptFile, styleFile, pkgFile, setup, cleanup };
}
