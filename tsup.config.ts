import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  shims: true,
  clean: true,
  format: ["esm", "cjs"],
  skipNodeModulesBundle: true,
  entryPoints: ["./src/index.ts"],
});
