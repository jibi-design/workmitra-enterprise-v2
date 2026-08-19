/**
 * Job Mitra — Employer Ultra-Enterprise UI smoke (U2–U5)
 * Run: npx playwright test tests/e2e/employer-enterprise-ui-smoke.spec.ts
 */

import { test, expect } from "@playwright/test";
import { initCareerRoleContext, ensureCareerEmployerProfileOnPage } from "./helpers/career-circuit.helpers";

test.describe("Employer Ultra-Enterprise UI smoke", () => {
  test("Shift posts list exposes empty or skeleton contract", async ({ page }) => {
    await initCareerRoleContext(page, "employer");
    await page.goto("/#/employer/shift/posts", { waitUntil: "domcontentloaded" });
    await ensureCareerEmployerProfileOnPage(page);
    await expect(page.locator(".wm-er-vShift, .wm-shiftPostsPage").first()).toBeVisible({
      timeout: 20_000,
    });
    const emptyOrList = page
      .getByTestId("shift-posts-empty")
      .or(page.locator(".wm-shiftPostsList"));
    await expect(emptyOrList.first()).toBeVisible({ timeout: 15_000 });
  });

  test("Career posts filter grid is present", async ({ page }) => {
    await initCareerRoleContext(page, "employer");
    await page.goto("/#/employer/career/posts");
    await ensureCareerEmployerProfileOnPage(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("career-posts-filter-grid")).toBeVisible({ timeout: 20_000 });
  });

  test("Planner command grid uses enterprise responsive contract", async ({ page }) => {
    await initCareerRoleContext(page, "employer");
    await page.goto("/#/employer/planner/plans");
    await ensureCareerEmployerProfileOnPage(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.getByTestId("planner-command-grid").or(page.getByTestId("planner-plans-empty")),
    ).toBeVisible({ timeout: 20_000 });
  });
});
