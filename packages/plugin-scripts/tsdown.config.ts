import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  deps: { skipNodeModulesBundle: true },
  platform: "node",
  target: "node18",
});
