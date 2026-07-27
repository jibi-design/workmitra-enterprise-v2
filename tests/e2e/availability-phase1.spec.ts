import { expect, test } from "@playwright/test";
import {
  E2E_BASE_URL,
  SHIFT_ACTIVE_GREEN_RGB,
  bootstrapEmployeeSession,
  bootstrapEmployerSession,
  gotoHash,
} from "./helpers/e2e-bootstrap";
import { E2E_IDS, seedEmployerShiftDemo } from "./helpers/storage-seed";

const AVAIL_MY_KEY = "wm_employee_availability_broadcast_v1";

test.describe("Phase 1 — Availability Calendar & Privacy (live UI)", () => {
  test("Test 1 — Employee 7-day calendar: tap Thu + Sat, green active state + auto-save", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await bootstrapEmployeeSession(page);
    await gotoHash(page, "/#/employee/shift");

    await expect(page.getByText("My availability — next 7 days")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Shift Jobs").first()).toBeVisible();

    const calendar = page.locator('[aria-label="7-day rolling availability calendar"]');
    await expect(calendar).toBeVisible();

    const thursday = calendar.locator(
      'button.wm-shiftAvailabilityCalendar__day[aria-label^="Thu "]',
    );
    const saturday = calendar.locator(
      'button.wm-shiftAvailabilityCalendar__day[aria-label^="Sat "]',
    );

    await expect(thursday).toBeVisible();
    await expect(saturday).toBeVisible();

    // Off state before selection
    await expect(thursday).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".wm-shiftAvailabilityCalendar__summary.isActive")).toHaveCount(0);

    // Physical taps — Thursday
    await thursday.click();
    await expect(thursday).toHaveAttribute("aria-pressed", "true");
    await expect(thursday).toHaveCSS("background-color", SHIFT_ACTIVE_GREEN_RGB);
    await expect(page.locator(".wm-shiftAvailabilityCalendar__summary.isActive")).toBeVisible();
    await expect(page.locator(".wm-shiftAvailabilityCalendar__summary.isActive")).toContainText(
      /You are free on:/i,
    );

    // Physical taps — Saturday
    await saturday.click();
    await expect(saturday).toHaveAttribute("aria-pressed", "true");
    await expect(saturday).toHaveCSS("background-color", SHIFT_ACTIVE_GREEN_RGB);

    const summary = page.locator(".wm-shiftAvailabilityCalendar__summary.isActive");
    await expect(summary).toContainText("Thu");
    await expect(summary).toContainText("Sat");

    const storedDates = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return [] as string[];
      const parsed = JSON.parse(raw) as { selectedDates?: string[] };
      return Array.isArray(parsed.selectedDates) ? parsed.selectedDates : [];
    }, AVAIL_MY_KEY);

    expect(storedDates.length).toBeGreaterThanOrEqual(2);
  });

  test("Test 2 — Employer Shift Home: Local Workers Radar live count (blind privacy)", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const todayIso = new Date().toISOString().slice(0, 10);
    const rollingDates = await page.evaluate(() => {
      const days: string[] = [];
      const base = new Date();
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        days.push(`${y}-${m}-${day}`);
      }
      return days;
    });

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, {
      withAppliedApps: false,
      withPendingReview: false,
      availabilityBroadcasts: [
        {
          workerMlId: "ML-E2EA-RDR-AAA2",
          workerName: "Hidden Worker Alpha",
          selectedDates: [todayIso],
        },
        {
          workerMlId: "ML-E2EB-RDR-AAA3",
          workerName: "Hidden Worker Beta",
          selectedDates: [rollingDates[2] ?? todayIso],
        },
        {
          workerMlId: "ML-E2EC-RDR-AAA4",
          workerName: "Hidden Worker Gamma",
          selectedDates: [rollingDates[4] ?? todayIso],
        },
      ],
    });

    await gotoHash(page, "/#/employer/shift");

    await expect(page.getByRole("button", { name: "New Shift" })).toBeVisible({ timeout: 20_000 });

    const radarCard = page.getByTestId("local-workers-radar-card");
    await expect(radarCard).toBeVisible();
    await expect(radarCard).toHaveClass(/wm-shiftLocalWorkersRadar--active/);
    await expect(radarCard.getByRole("heading", { name: "Local Workers Radar" })).toBeVisible();

    const activeLine = radarCard.locator(".wm-shiftLocalWorkersRadar__sub--active");
    await expect(activeLine).toBeVisible();
    await expect(activeLine).toHaveText(/3 workers ready to work this week/i);

    // Anti-leakage: worker identities must never appear on the card
    await expect(radarCard).not.toContainText("Hidden Worker Alpha");
    await expect(radarCard).not.toContainText("Hidden Worker Beta");
    await expect(radarCard).not.toContainText("Hidden Worker Gamma");
    await expect(page.getByRole("button", { name: /open workers/i })).toHaveCount(0);
  });

  test("Employer create shift wizard — nearby availability blind count", async ({ page }) => {
    test.setTimeout(120_000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, {
      withAppliedApps: false,
      availabilityBroadcasts: [
        { workerMlId: "ML-E2EA-AVL-AAAA", workerName: "Hidden A", selectedDates: [iso] },
        { workerMlId: "ML-E2EB-AVL-AAAB", workerName: "Hidden B", selectedDates: [iso] },
      ],
    });

    await gotoHash(page, "/#/employer/shift/create");
    await expect(page.getByTestId("shift-create-wizard-topbar")).toBeVisible({ timeout: 15_000 });

    await page.locator('input[placeholder="Enter company name"]').click();
    await page.locator('input[placeholder="Enter company name"]').fill("E2E Demo Corp");
    await page.locator('input[placeholder="e.g. Driver, Helper, Cleaner"]').click();
    await page
      .locator('input[placeholder="e.g. Driver, Helper, Cleaner"]')
      .fill("Warehouse Helper");
    await page.locator('input[placeholder="Enter number"]').click();
    await page.locator('input[placeholder="Enter number"]').fill("2");

    await page.getByTestId("shift-create-wizard-next").click();
    await expect(page.getByText("Schedule and Pay")).toBeVisible();

    const hint = page.getByTestId("shift-create-nearby-availability-card");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText("2 available workers found nearby for this date");
    await expect(hint).not.toContainText("Hidden A");
    await expect(hint).not.toContainText("Hidden B");
    await expect(page.getByRole("button", { name: /invite/i })).toHaveCount(0);
  });

  test("Candidate detail — Free badge when availability dates match shift", async ({ page }) => {
    test.setTimeout(90_000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, {
      withAppliedApps: true,
      postStartIso: iso,
      availabilityBroadcasts: [
        {
          workerMlId: "ML-E2E2-CND-AAA2",
          workerName: "Rahul Kumar",
          selectedDates: [iso],
        },
      ],
    });

    await page.goto(
      `${E2E_BASE_URL}/#/employer/shift/post/${E2E_IDS.postId}/candidate/${E2E_IDS.appApplied}`,
    );
    await expect(page.getByText("Candidate Detail")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Free on/i)).toBeVisible();
    await expect(page.getByText(/Phone: •••• ••••/)).toBeVisible();
  });

  test("Employee role home — pending actions hub visible", async ({ page }) => {
    test.setTimeout(90_000);

    await bootstrapEmployeeSession(page);
    await gotoHash(page, "/#/employee");

    await expect(page.getByText("Shift Jobs").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("pending-actions-hub")).toBeVisible();
    await expect(page.getByText("Pending Actions")).toBeVisible();
  });

  test("Employer role home — pending actions hub visible", async ({ page }) => {
    test.setTimeout(90_000);

    await bootstrapEmployerSession(page);
    await seedEmployerShiftDemo(page, { withAppliedApps: false, withPendingReview: false });

    await gotoHash(page, "/#/employer");
    await expect(page.getByText("Recruitment Hub")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("pending-actions-hub")).toBeVisible();
    await expect(page.getByText("Pending Actions")).toBeVisible();
  });

  test("Employee shift home — reviews card navigates to review center", async ({ page }) => {
    test.setTimeout(90_000);

    await bootstrapEmployeeSession(page);
    await gotoHash(page, "/#/employee/shift");

    await expect(page.getByText("Shift Jobs").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("pending-actions-hub")).toHaveCount(0);

    const reviewsCard = page.getByTestId("shift-employee-reviews-card");
    await expect(reviewsCard).toBeVisible();
    await reviewsCard.click();

    await expect(page).toHaveURL(new RegExp(`${E2E_BASE_URL}/#/employee/review-center`));
    await expect(page.getByText(/Review Center/i).first()).toBeVisible();
  });
});
