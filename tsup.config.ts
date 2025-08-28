import { defineConfig } from "tsup"

export default defineConfig({
entry: [
  "src/index.ts",
  "src/shard.ts",
  "src/deploy/deploy-commands.ts",
  "src/commands/**/*.ts",
  "src/events/**/*.ts",
  "src/jobs/**/*.ts",
  "src/modules/**/*.ts",
  "src/components/**/*.ts"
],
  format: ["esm"],
  splitting: false,
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  platform: "node",
  external: ["discord.js"]
})
