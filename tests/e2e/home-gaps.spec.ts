import { expect, test } from "@playwright/test";
import { seedVerifiedEmployerProfile } from "./helpers/e2e-employer-profile";
import {
  E2E_IDS,
  gotoEmployerShiftHome,
  gotoPostDashboard,
  injectPendingReviewWorkspace,
  openEmployerShiftReviewFromHub,
  seedEmployerShiftDemo,
} from "./helpers/storage-seed";

/**
 * Job Mitra — "5 Gaps" E2E Suite
 *
 * Gap 1: Candidate Detail route loads (Test 4)
 * Gap 2: KPI Applied drill-down + filter banner (Test 1)
 * Gap 3: Reviews pending count via role-home PendingActionsHub (Test 2)
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

    const appliedTile = page.getByRole("button", { name: /View 2 applied candidates/i });
    await expect(appliedTile).toBeVisible();
    await expect(appliedTile.getByText("TAP TO VIEW")).toBeVisible();

    await appliedTile.click();

    await expect(page).toHaveURL(/\/#\/employer\/shift\/posts\?status=applied/);
    await expect(page.getByTestId("shift-posts-page")).toBeVisible();
    await expect(page.getByText("My Posts").first()).toBeVisible();
    await expect(page.getByTestId("shift-posts-status-filter")).toContainText(
      "Showing posts with pending applications",
    );
    await expect(
      page.getByRole("button", { name: /Open Warehouse Helper at E2E Demo Corp/i }),
    ).toBeVisible();
  });

  test("Test 2 — Reviews tile shows pending count after mock inject (Gap 3)", async ({ page }) => {
    await seedVerifiedEmployerProfile(page);
    await gotoEmployerShiftHome(page);
    await injectPendingReviewWorkspace(page);

    await page.goto("/#/employer");
    await expect(page.getByTestId("employer-home-launcher")).toBeVisible({ timeout: 15_000 });

    const banner = page.getByTestId("employer-pending-actions-banner");
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(banner.getByText(/Worker review pending/i)).toBeVisible();
  });

  test("Test 3 — Reviews tile opens Review Center", async ({ page }) => {
    await seedVerifiedEmployerProfile(page);
    await page.goto("/#/employer/shift");
    await page.getByRole("button", { name: "New Shift" }).waitFor({ state: "visible" });
    await injectPendingReviewWorkspace(page);

    await page.goto("/#/employer");
    await openEmployerShiftReviewFromHub(page);
    await expect(page).toHaveURL(/\/#\/employer\/review-center/);
  });

  test("Test 4 — Candidate Detail route loads from Post Dashboard (Gap 1)", async ({ page }) => {
    await gotoPostDashboard(page);

    await expect(page.getByText("Worker A")).toBeVisible();

    await page.getByRole("button", { name: "ML-E2E2-CND-AAA2" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/#/employer/shift/post/${E2E_IDS.postId}/candidate/${E2E_IDS.appApplied}`),
    );

    await expect(page.getByText("Candidate Detail")).toBeVisible();
    await expect(page.getByText("Worker A")).toBeVisible();
    await expect(page.getByText("Application not found")).toHaveCount(0);
  });

  test("Test 5 — Reviews tile opens Review Center with pending seed", async ({ page }) => {
    await seedVerifiedEmployerProfile(page);
    await seedEmployerShiftDemo(page, {
      withAppliedApps: true,
      withPendingReview: false,
    });

    await page.goto("/#/employer/shift");
    await page.getByRole("button", { name: "New Shift" }).waitFor({ state: "visible" });
    await injectPendingReviewWorkspace(page);

    await page.goto("/#/employer");
    await openEmployerShiftReviewFromHub(page);
    await expect(page).toHaveURL(/\/#\/employer\/review-center/);
  });
});
