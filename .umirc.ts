import { defineConfig } from "umi";

export default defineConfig({
  outputPath: "docs",
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
  ],
  npmClient: "pnpm",
});
