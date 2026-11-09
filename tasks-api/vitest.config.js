import { defineConfig } from "vitest/config";

// Playwright specs live in e2e/ and must not be picked up by Vitest.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    // Integration tests share one database: run files sequentially.
    fileParallelism: false,
  },
});
