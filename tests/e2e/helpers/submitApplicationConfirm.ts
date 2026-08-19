import { expect, type Page } from "@playwright/test";

/** Confirm the apply warning modal added as a fat-finger guard. */
export async function confirmSubmitApplication(page: Page): Promise<void> {
  const confirm = page.getByRole("button", { name: /Yes, submit/i });
  const appeared = await confirm
    .waitFor({ state: "visible", timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (appeared) {
    await confirm.click();
  }
}
