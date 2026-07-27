/**
 * Job Mitra — Calling E2E stubs (Phase 5 / Board)
 * Code landed in Phase 3 — stubs remain skipped until LIVE secrets + bridge.
 * Path: playwright/e2e/calling.spec.ts
 */
import { expect, test } from "@playwright/test";

test.describe("Calling — Board E2E stubs (await LIVE secrets)", () => {
  test("CALL-E2E-01: Manager clicks Call → ringing state shown", async ({ page }) => {
    test.skip(true, "Stub — enable when AGORA_* + auth bridge live");
    await page.goto("/#/employer/shift/workspaces");
    await expect(page.getByTestId("call-worker-button")).toBeVisible();
  });

  test("CALL-E2E-02: Agora channel join fails → graceful connection failed shown", async ({
    page,
  }) => {
    test.skip(true, "Stub — enable when AGORA_* live");
    await expect(page.getByText(/connection failed/i)).toBeVisible();
  });

  test("CALL-E2E-03: 30s no-answer → Twilio fallback triggered (server mock)", async ({ page }) => {
    test.skip(true, "Stub — enable with job:call-fallback + TWILIO_*");
    await expect(page.getByTestId("call-active-panel")).toBeVisible();
  });

  test("CALL-E2E-04: Worker declines → manager sees Call declined state", async ({ page }) => {
    test.skip(true, "Stub — enable when calling API live");
    await expect(page.getByText(/declined/i)).toBeVisible();
  });

  test("CALL-E2E-05: End call from manager side → session status ended", async ({ page }) => {
    test.skip(true, "Stub — enable when calling API live");
    await page.getByTestId("call-end-btn").click();
    await expect(page.getByText(/ended/i)).toBeVisible();
  });
});
