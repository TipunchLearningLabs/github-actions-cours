import { defineConfig } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    extraHTTPHeaders: { Accept: "application/json" },
  },
  // Starts the real API before the tests. It inherits process.env,
  // so MONGODB_URI / MONGODB_DB_NAME / PORT flow from the shell or the CI job.
  webServer: {
    command: "pnpm start",
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    timeout: 30_000,
  },
});
