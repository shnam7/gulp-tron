import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  deps: {
    neverBundle: ["gulp-tron"],
    skipNodeModulesBundle: true,
    onlyBundle: false,
  },
  platform: "node",
  target: "node18",
});
