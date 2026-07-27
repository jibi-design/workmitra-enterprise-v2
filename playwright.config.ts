import { defineConfig, devices } from "@playwright/test";

/**
 * Job Mitra E2E — Playwright configuration (MNC matrix-ready)
 * HashRouter paths: `/#/employer/shift/...`
 */
export default defineConfig({
  testDir: ".",
  testMatch: ["**/tests/e2e/**/*.spec.ts", "**/playwright/e2e/**/*.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: "http://localhost:5173",
    trace: process.env.PW_TRACE === "1" ? "on" : process.env.CI ? "on-first-retry" : "off",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    // PW_FORCE_FRESH=1 kills reuse so inspection hits a newly spawned Vite (no stale HMR shell).
    reuseExistingServer: process.env.PW_FORCE_FRESH === "1" ? false : !process.env.CI,
    timeout: 120_000,
  },
});
