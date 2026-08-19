/**
 * Targeted safeguard checks — offline banner, session restore, error fallback.
 * Not the 65-spec suite. Hash router: /#/login
 */
import { expect, test } from "@playwright/test";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1280, height: 900 } });

test("offline banner, session refresh, and error fallback stay safe", async ({ page, context }) => {
  test.setTimeout(120_000);
  await wipeBrowserState(page);

  await page.goto("/#/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".wm-errorFallback")).toHaveCount(0);

  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByTestId("network-offline-banner")).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText("No Internet Connection")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByTestId("network-offline-banner")).toHaveCount(0);

  await signInAs(page, "employer@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(page, "employer");
  await expect(page).toHaveURL(/\/#\/employer/, { timeout: 20_000 });

  await page.goto("/#/employer/shift/workspaces", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("employer-shift-workspaces-page")).toBeVisible({ timeout: 20_000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("employer-shift-workspaces-page")).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/#\/employer\/shift\/workspaces/, { timeout: 15_000 });
  await expect(page.locator(".wm-errorFallback")).toHaveCount(0);
  await expect(page.getByTestId("network-offline-banner")).toHaveCount(0);
});
