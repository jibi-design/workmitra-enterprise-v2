/**
 * Job Mitra | visual-inspection-employee-planner-applications.spec.ts
 * Track T1-4 — employee applications empty + smash/4-state visual audit.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-employee-planner-applications.spec.ts
 */

import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  defaultReportPath,
  formatVerdictMarkdown,
  runVisualInspector,
} from "./helpers/visual-assertion-inspector";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const APPS_PATH = "/employee/planner/applications";
const REPORT_JSON = defaultReportPath("employee-planner-applications");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");

const APPS_SMASH_NEEDLES = [
  "My Project ApplicationsMulti",
  "Browse ProjectsTrack",
  "Empty catalogBrowse",
  "No applications yetBrowse",
] as const;

test.describe("Employee Planner Applications Visual Inspection", () => {
  test("FINAL — applications hero + empty state + no smash", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employee");
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({
            uniqueId: "ML-E2E-APPS-VIS",
            fullName: "Apps Visual",
            skills: [],
          }),
        );
        localStorage.setItem("wm_employee_shift_applications_v1", JSON.stringify([]));
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    await page.goto(`/?pw_apps_vis=${bust}#${APPS_PATH}`, { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/employee\/planner\/applications/);
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByTestId("planner-employee-applications")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("My Project Applications")).toBeVisible();
    await expect(page.getByTestId("planner-applications-empty")).toBeVisible();
    await expect(page.getByTestId("planner-applications-empty-cta")).toBeVisible();

    await page.screenshot({
      path: join(process.cwd(), "test-results", "employee-planner-applications-full.png"),
      fullPage: true,
    });

    const verdict = await runVisualInspector(page, {
      target: APPS_PATH,
      domain: "planner",
      reportPath: REPORT_JSON,
      proofMustCapture: [],
    });

    const md = formatVerdictMarkdown(verdict);
    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, md, "utf8");

    for (const banned of APPS_SMASH_NEEDLES) {
      expect(verdict.proofCaptures).not.toContain(banned);
    }

    expect(verdict.summary.critical, md).toBe(0);
    expect(verdict.summary.high, md).toBe(0);
    expect(verdict.ok, md).toBe(true);

    await context.close();
  });
});
