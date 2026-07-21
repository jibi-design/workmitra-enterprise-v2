/**
 * Job Mitra — Employer Command Palette smoke (Luxury L1)
 * Run: npx playwright test tests/e2e/employer-command-palette-smoke.spec.ts
 */

import { test, expect } from "@playwright/test";
import { initCareerRoleContext } from "./helpers/career-circuit.helpers";

test.describe("Employer Command Palette L1", () => {
  test("opens with Ctrl+K, filters, navigates, Escape closes", async ({ page }) => {
    await initCareerRoleContext(page, "employer");
    await page.goto("/#/employer");
    await expect(page.locator(".wm-shellEmployer").first()).toBeVisible({ timeout: 20_000 });

    await page.keyboard.press("Control+KeyK");
    await expect(page.getByTestId("wm-ent-command-palette")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("wm-ent-command-palette-input").fill("planner home");
    await expect(page.getByTestId("wm-ent-command-item-planner-home")).toBeVisible();
    await page.getByTestId("wm-ent-command-item-planner-home").click();

    await expect(page).toHaveURL(/employer\/planner\/home/);
    await expect(page.getByTestId("wm-ent-command-palette")).toHaveCount(0);

    await page.keyboard.press("Control+KeyK");
    await expect(page.getByTestId("wm-ent-command-palette")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("wm-ent-command-palette")).toHaveCount(0);
  });
});
