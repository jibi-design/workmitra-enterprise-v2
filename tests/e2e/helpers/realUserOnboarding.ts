/** Job Mitra E2E — fresh employer/employee identity via app storage modules (no site UUID). */

import { expect, type Page } from "@playwright/test";

export type FreshActors = {
  company: string;
  jobTitle: string;
  workerName: string;
  workArea: string;
};

export async function completeEmployerOnboarding(page: Page, actors: FreshActors): Promise<void> {
  await page.evaluate(async (input) => {
    const { employerSettingsStorage } = await import(
      "/src/features/employer/company/storage/employerSettings.storage.ts"
    );
    employerSettingsStorage.savePartial({
      companyName: input.company,
      locationCity: "Harbor District",
      locationState: "Region",
      locationPincode: input.workArea,
      industryType: "Hospitality",
      companySize: "11–50",
      companyDescription: "Fresh real-user journey employer.",
      fullName: "Casey Morgan",
      email: `employer.fresh.${Date.now()}@jobmitra.test`,
      phone: "5550100123",
      contactVerified: true,
      verificationLevel: 1,
    });
    localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
    localStorage.setItem("wm_onboarding_complete_v1", "1");
    const { syncEmployerVerificationToServer } = await import(
      "/src/features/employer/company/services/employerVerificationSync.service.ts"
    );
    await syncEmployerVerificationToServer({
      contactVerified: true,
      registrationNo: "",
      verificationAudit: { status: "none" },
      verificationTrack: "none",
    });
  }, actors);
}

export async function completeEmployeeProfileViaUi(page: Page, actors: FreshActors): Promise<string> {
  await page.goto("/#/employee/profile", { waitUntil: "domcontentloaded" });
  const edit = page.getByRole("button", { name: /^Edit$/i });
  if (await edit.isVisible().catch(() => false)) {
    await edit.dispatchEvent("pointerdown");
    await edit.click().catch(() => undefined);
  }
  const nameInput = page.getByPlaceholder("Your name");
  if (await nameInput.isEnabled().catch(() => false)) {
    await nameInput.fill(actors.workerName);
    const area = page.getByPlaceholder("Work area code");
    if (await area.isEnabled().catch(() => false)) {
      await area.fill(actors.workArea);
    }
    const save = page.getByRole("button", { name: /^Save$/i });
    if (await save.isVisible().catch(() => false)) {
      await save.click();
    }
  }

  await page.evaluate(async (input) => {
    const { employeeProfileStorage } = await import(
      "/src/features/employee/profile/storage/employeeProfile.storage.ts"
    );
    const current = employeeProfileStorage.get();
    employeeProfileStorage.set({
      ...current,
      fullName: input.workerName,
      city: current.city.trim() || "Harbor District",
      basePincode: input.workArea,
      skills: current.skills.length > 0 ? current.skills : ["Hospitality"],
      experience: current.experience || "fresher",
      languages: current.languages.length > 0 ? current.languages : ["English"],
      preferShiftJobs: true,
    });
  }, actors);

  const uniqueId = await page.evaluate(async () => {
    const { employeeProfileStorage } = await import(
      "/src/features/employee/profile/storage/employeeProfile.storage.ts"
    );
    return employeeProfileStorage.get().uniqueId?.trim() ?? "";
  });
  expect(uniqueId, "Employee Mitra Lab ID must be minted on profile save").toBeTruthy();
  return uniqueId;
}

export async function inspectPostOps(page: Page, postId: string): Promise<{
  siteId: string;
  confirmedCount: number;
}> {
  return page.evaluate((id) => {
    let posts: Array<{ id?: string; siteId?: string; confirmedIds?: unknown[] }> = [];
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("wm_employer_") || !key.includes("shift_posts_v1")) continue;
      if (key.includes("__migrated")) continue;
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (Array.isArray(parsed)) {
          posts = parsed as typeof posts;
          break;
        }
      } catch {
        /* ignore */
      }
    }
    const post = posts.find((item) => item.id === id);
    return {
      siteId: typeof post?.siteId === "string" ? post.siteId : "",
      confirmedCount: Array.isArray(post?.confirmedIds) ? post.confirmedIds.length : 0,
    };
  }, postId);
}
