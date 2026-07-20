import { defineConfig, devices } from "@playwright/test";

/**
 * Job Mitra E2E — Playwright configuration
 *
 * The app uses HashRouter, so tests navigate with `/#/employer/shift` style paths.
 * Vite dev server must be running (or started via webServer below).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: "http://localhost:5173",
    // Local Windows runs: trace/video stacks files can race ENOENT and abort tests mid-step.
    // Enable explicitly with PW_TRACE=1 when debugging a failure.
    trace: process.env.PW_TRACE === "1" ? "on" : process.env.CI ? "on-first-retry" : "off",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    ...devices["Desktop Chrome"],
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
