/**
 * Employer home ticker: × and chevron must be clickable; dismiss → All Clear.
 * Hash router: /#/employer
 */
import { expect, test } from "@playwright/test";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";

test.use({ viewport: { width: 1280, height: 900 } });

test("employer pending ticker close control is clickable and reaches All Clear", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await wipeBrowserState(page);
  await signInAs(page, "employer@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(page, "employer");
  await expect(page).toHaveURL(/\/#\/employer/, { timeout: 20_000 });

  const ticker = page.getByTestId("employer-home-inbox-ticker");
  await expect(ticker).toBeVisible({ timeout: 20_000 });

  const dismiss = ticker.getByTestId("home-status-strip-dismiss");
  await expect(dismiss).toBeVisible();
  const box = await dismiss.boundingBox();
  expect(box).toBeTruthy();
  expect((box?.width ?? 0) >= 24).toBe(true);
  expect((box?.height ?? 0) >= 24).toBe(true);

  const status = await ticker.getAttribute("data-strip-status");
  await dismiss.click();

  if (status === "pending") {
    await expect(ticker).toHaveAttribute("data-strip-status", "clear");
    await expect(ticker.getByText(/All Clear/i)).toBeVisible();
  } else {
    await expect(ticker).toHaveCount(0);
  }
});
