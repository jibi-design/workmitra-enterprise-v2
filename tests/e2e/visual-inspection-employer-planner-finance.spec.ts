/**
 * Job Mitra | visual-inspection-employer-planner-finance.spec.ts
 * Track T1-4 optional — finance placeholder visual smoke (inspector + no smash).
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/visual-inspection-employer-planner-finance.spec.ts
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
const PLAN = "dp_e2e_finance_vis";
const FINANCE_PATH = `/employer/planner/plans/${PLAN}/finance`;
const REPORT_JSON = defaultReportPath("employer-planner-finance");
const REPORT_MD = REPORT_JSON.replace(/\.json$/, ".md");

test.describe("Employer Planner Finance Visual Inspection", () => {
  test("FINAL — finance snapshot surface + inspector clean", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.addInitScript(
      ({ splashKey, planId }) => {
        sessionStorage.setItem("wm_role_session_v1", "employer");
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem(
          "wm_employer_demand_plans_v1",
          JSON.stringify([
            {
              id: planId,
              name: "Finance Visual Plan",
              companyName: "Vis Co",
              locationName: "City A",
              category: "Security",
              experience: "experienced",
              startDate: "2026-11-01",
              endDate: "2026-11-02",
              workingDays: [0, 1],
              slots: [
                { date: "2026-11-01", workers: 1, payPerDay: 900, slotId: `sl_${planId}_1` },
                { date: "2026-11-02", workers: 1, payPerDay: 900, slotId: `sl_${planId}_2` },
              ],
              status: "active",
              createdAt: 1,
              updatedAt: 1,
              schemaVersion: 2,
              legalEntityMlId: "ML-FIN-VIS",
              epochDays: 30,
              milestoneCursor: 0,
              publishStatus: "published",
            },
          ]),
        );
      },
      { splashKey: SPLASH_KEY, planId: PLAN },
    );

    const bust = Date.now();
    await page.goto(`/?pw_fin_vis=${bust}#${FINANCE_PATH}`, { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/employer/planner/plans/${PLAN}/finance`));
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByTestId("planner-employer-finance")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("planner-employer-finance-snapshot")).toBeVisible();
    await expect(page.getByTestId("planner-employer-finance-back")).toBeVisible();

    await page.screenshot({
      path: join(process.cwd(), "test-results", "employer-planner-finance-full.png"),
      fullPage: true,
    });

    const verdict = await runVisualInspector(page, {
      target: FINANCE_PATH,
      domain: "planner",
      reportPath: REPORT_JSON,
      proofMustCapture: [],
    });

    const md = formatVerdictMarkdown(verdict);
    mkdirSync(dirname(REPORT_MD), { recursive: true });
    writeFileSync(REPORT_MD, md, "utf8");

    expect(verdict.summary.critical, md).toBe(0);
    expect(verdict.summary.high, md).toBe(0);
    expect(verdict.ok, md).toBe(true);

    await context.close();
  });
});
