import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  outDir: "dist",
  treeshake: true,
  minify: false,
  platform: "node",
  target: "node18", // 프로젝트 사양에 맞게 조정 (e.g., es2022)
});
