import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  dts: true,
  cjsDefault: false,
  deps: { neverBundle: true },
  platform: "node",
  target: "node20",
});
