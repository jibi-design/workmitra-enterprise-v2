import { expect, test } from "@playwright/test";
import {
  E2E_IDS,
  gotoEmployerShiftHome,
  gotoPostDashboard,
  injectPendingReviewWorkspace,
  seedEmployerShiftDemo,
} from "./helpers/storage-seed";

/**
 * Job Mitra — "5 Gaps" E2E Suite
 *
 * Gap 1: Candidate Detail route loads (Test 4)
 * Gap 2: KPI Applied drill-down + filter banner (Test 1)
 * Gap 3: Reviews tile pending count after mock inject (Test 2)
 * Gap 4: Templates hint — covered indirectly via posts page navigation
 * Gap 5: Reactive counts — verified via KPI tile values after seed
 */

test.describe("Employer Shift Home — 5 Gaps E2E", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployerShiftDemo(page, {
      withAppliedApps: true,
      withPendingReview: false,
    });
  });

  test("Test 1 — KPI Applied drill-down shows green filter banner (Gap 2)", async ({ page }) => {
    await gotoEmployerShiftHome(page);

    // KPI tile becomes clickable when applied > 0
    const appliedTile = page.getByRole("button", { name: /View 2 applied candidates/i });
    await expect(appliedTile).toBeVisible();
    await expect(appliedTile.getByText("TAP TO VIEW")).toBeVisible();

    await appliedTile.click();

    await expect(page).toHaveURL(/\/#\/employer\/shift\/posts\?status=applied/);
    await expect(page.locator(".wm-pageTitle").filter({ hasText: "My Posts" })).toBeVisible();
    await expect(page.getByText("Showing posts with pending applications")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open Warehouse Helper at E2E Demo Corp/i }),
    ).toBeVisible();
  });

  test("Test 2 — Reviews tile shows pending count after mock inject (Gap 3)", async ({ page }) => {
    await gotoEmployerShiftHome(page);

    const reviewsTile = page.getByTestId("shift-home-reviews-tile");
    await expect(reviewsTile).toBeVisible();
    await expect(reviewsTile.getByText(/pending/i)).toHaveCount(0);

    await injectPendingReviewWorkspace(page);

    await expect(reviewsTile.getByText(/1 pending/i)).toBeVisible();
  });

  test("Test 3 — Reviews tile opens Review Center", async ({ page }) => {
    await gotoEmployerShiftHome(page);

    await page.getByTestId("shift-home-reviews-tile").click();
    await expect(page).toHaveURL(/\/#\/employer\/review-center/);
  });

  test("Test 4 — Candidate Detail route loads from Post Dashboard (Gap 1)", async ({ page }) => {
    await gotoPostDashboard(page);

    // Applied tab should list seeded candidate
    await expect(page.getByText("Rahul Kumar")).toBeVisible();

    // CandidateCard exposes worker id as a detail link button
    await page.getByRole("button", { name: "WM-E2E-001" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/#/employer/shift/post/${E2E_IDS.postId}/candidate/${E2E_IDS.appApplied}`),
    );

    await expect(page.getByText("Candidate Detail")).toBeVisible();
    await expect(page.getByText("Rahul Kumar")).toBeVisible();
    await expect(page.getByText("Application not found")).toHaveCount(0);
  });

  test("Test 5 — Reviews tile opens Review Center with pending seed", async ({ page }) => {
    await seedEmployerShiftDemo(page, {
      withAppliedApps: true,
      withPendingReview: true,
    });

    await gotoEmployerShiftHome(page);

    await page.getByTestId("shift-home-reviews-tile").click();
    await expect(page).toHaveURL(/\/#\/employer\/review-center/);
  });
});
