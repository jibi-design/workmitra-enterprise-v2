import { defineConfig, devices } from "@playwright/test";

/**
 * Headed Visual Stress Suite — video + live list reporter.
 * Videos land in ./test-results/videos
 *
 * npm run test:e2e:visual-stress
 */
export default defineConfig({
  testDir: ".",
  testMatch: ["**/tests/e2e/visual-e2e-stress-suite.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/visual-stress" }],
  ],
  timeout: 360_000,
  expect: { timeout: 30_000 },
  outputDir: "test-results/videos",

  use: {
    baseURL: "http://localhost:5173",
    headless: false,
    trace: "retain-on-failure",
    screenshot: "on",
    video: {
      mode: "on",
      size: { width: 1400, height: 900 },
    },
    viewport: { width: 1400, height: 900 },
  },

  projects: [
    {
      name: "chromium-visual-stress",
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
        launchOptions: { slowMo: 40 },
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: process.env.PW_FORCE_FRESH === "1" ? false : !process.env.CI,
    timeout: 180_000,
  },
});
