/**
 * Job Mitra | visual-inspection-help-support.spec.ts
 * Sample visual audit — Help & Support (DomainHero pageHead purge).
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-help-support.spec.ts
 */

import { expect, test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  defaultReportPath,
  formatVerdictMarkdown,
  runVisualInspector,
} from "./helpers/visual-assertion-inspector";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const HELP_PATH = "/employee/help";
const REPORT_JSON = defaultReportPath("help-support");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");

test.describe("Visual Inspection — Help & Support", () => {
  test("geometry + enterprise hero compliance sample", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", "employee");
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({
            uniqueId: "ML-E2E-HELP-AUDIT",
            fullName: "Help Audit",
            skills: [],
          }),
        );
      },
      { splashKey: SPLASH_KEY },
    );

    const bust = Date.now();
    await page.goto(`/?pw_help=${bust}#${HELP_PATH}`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/employee\/help/);
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByRole("heading", { name: "Help & Support" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(".wm-domainHero--settings").first()).toBeVisible();
    await expect(page.locator(".wm-helpFaqCard").first()).toBeVisible();

    const verdict = await runVisualInspector(page, {
      target: HELP_PATH,
      domain: "unknown",
      proofMustCapture: [],
      reportPath: REPORT_JSON,
    });

    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, formatVerdictMarkdown(verdict), "utf8");

    const blocking = verdict.findings.filter(
      (f) => f.severity === "critical" || f.severity === "high",
    );
    expect(
      blocking,
      `Help Support visual audit failed:\n${formatVerdictMarkdown(verdict)}`,
    ).toEqual([]);
    expect(verdict.ok).toBe(true);

    await context.close();
  });
});
