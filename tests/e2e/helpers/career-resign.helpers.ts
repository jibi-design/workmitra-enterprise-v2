import { expect, type Page } from "@playwright/test";

/** Close Career NoticeModal (joined / resign / cannot) so it cannot steal clicks. */
export async function dismissCareerNoticeOk(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog").filter({
    has: page.locator(".wm-noticeModal"),
  });
  if (!(await dialog.first().isVisible().catch(() => false))) return;

  await dialog
    .first()
    .getByRole("button", { name: /^OK$/i })
    .click({ timeout: 4_000 })
    .catch(async () => {
      await page.keyboard.press("Escape");
    });
  await dialog.first().waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
}

/** Hash-router remount after Work Diary — wait until workspace employment chrome is up. */
export async function gotoEmployeeCareerWorkspace(
  page: Page,
  workspaceId: string,
): Promise<void> {
  await dismissCareerNoticeOk(page);

  const hash = `/employee/career/workspace/${workspaceId}`;
  await page.evaluate((nextHash) => {
    window.location.hash = nextHash;
  }, hash);

  await expect(page).toHaveURL(new RegExp(`workspace/${workspaceId}`), { timeout: 20_000 });
  await expect(page.getByText("Employment status").first()).toBeVisible({ timeout: 20_000 });
}

export async function employerConfirmCareerJoining(page: Page): Promise<void> {
  await dismissCareerNoticeOk(page);

  const markJoined = page.getByTestId("career-mark-as-joined");
  const canJoin = await markJoined.isVisible().catch(() => false);

  if (canJoin) {
    await markJoined.click({ timeout: 10_000 });
    const joinDialog = page.getByRole("dialog", { name: "Mark as joined" });
    await expect(joinDialog).toBeVisible({ timeout: 10_000 });
    await joinDialog.getByTestId("career-confirm-joining").click({ timeout: 10_000 });
    await joinDialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => undefined);

    const notice = page.getByRole("dialog", { name: /Employee joined|Cannot update/i });
    if (await notice.isVisible().catch(() => false)) {
      await dismissCareerNoticeOk(page);
    }
  }

  await page.waitForFunction(
    () => {
      try {
        const raw = localStorage.getItem("wm_career_employment_v1");
        const rows = raw ? (JSON.parse(raw) as Array<{ status?: string }>) : [];
        return rows.some((row) => row.status === "working");
      } catch {
        return false;
      }
    },
    { timeout: 15_000 },
  );
}

/** Resign job → reason select → Submit; wait for modal to close. */
export async function employeeSubmitCareerResignation(page: Page): Promise<void> {
  await dismissCareerNoticeOk(page);

  await page.waitForFunction(
    () => {
      try {
        const raw = localStorage.getItem("wm_career_employment_v1");
        const rows = raw ? (JSON.parse(raw) as Array<{ status?: string }>) : [];
        return rows.some((row) => row.status === "working");
      } catch {
        return false;
      }
    },
    { timeout: 20_000 },
  );

  const resignBtn = page
    .getByTestId("career-resign-job")
    .or(page.getByRole("button", { name: /Resign job/i }));
  await expect(resignBtn.first(), "Resign job is enabled only after status is working").toBeVisible(
    { timeout: 20_000 },
  );
  await resignBtn.first().scrollIntoViewIfNeeded();
  await resignBtn.first().click();

  const resignDialog = page.getByRole("dialog", { name: "Resign from job" });
  await expect(resignDialog).toBeVisible({ timeout: 10_000 });

  await resignDialog
    .getByTestId("career-resign-reason")
    .or(resignDialog.locator("#wm-resign-reason"))
    .selectOption("better_opportunity");

  const submit = resignDialog
    .getByTestId("career-resign-submit")
    .or(resignDialog.getByRole("button", { name: "Submit resignation" }));
  await expect(submit).toBeEnabled({ timeout: 5_000 });
  await submit.click();
  await resignDialog.waitFor({ state: "hidden", timeout: 10_000 });

  await dismissCareerNoticeOk(page);
}

export async function employerConfirmCareerResignation(page: Page): Promise<void> {
  await dismissCareerNoticeOk(page);

  const confirmResign = page
    .getByTestId("career-confirm-resignation")
    .or(page.getByRole("button", { name: "Confirm resignation", exact: true }));
  await confirmResign.first().scrollIntoViewIfNeeded({ timeout: 15_000 });
  await confirmResign.first().click({ timeout: 15_000 });

  const confirmDialog = page.getByRole("dialog", { name: /Confirm resignation/i });
  await expect(confirmDialog).toBeVisible({ timeout: 10_000 });
  await confirmDialog.getByRole("button", { name: /^Confirm$/i }).click();
  await confirmDialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => undefined);
  await dismissCareerNoticeOk(page);
}
