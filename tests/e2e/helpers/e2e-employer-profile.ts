import type { Page } from "@playwright/test";

/** Verified employer profile — unlocks canPublishJobPosts() in planner/shift wizards. */
export const E2E_VERIFIED_EMPLOYER_PROFILE = {
  companyName: "E2E Demo Corp",
  registrationNo: "",
  industryType: "Logistics & Transport",
  companySize: "1-10",
  locationCity: "City A",
  locationState: "Kerala",
  locationPincode: "670001",
  companyDescription: "E2E verified employer",
  fullName: "E2E Employer",
  email: "employer@e2e.local",
  phone: "+919876543210",
  notificationsEnabled: true,
  hrManagementEnabled: true,
  language: "en",
  hapticFeedback: true,
  globalMute: false,
  quietHoursEnabled: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  shiftFavoritesFirstDefault: false,
  escrowHoldDefaultEnabled: true,
  transferStatus: "none",
  businessAdminIds: [],
  previousHandles: [],
  contactVerified: true,
  verificationLevel: 1,
  verificationTrack: "contact",
  uniqueId: "ML-E2E-EMP-AAA1",
} as const;

export async function seedVerifiedEmployerProfile(page: Page): Promise<void> {
  await page.addInitScript((profile) => {
    localStorage.setItem("wm_employer_profile_v1", JSON.stringify(profile));
    localStorage.setItem("wm:employer-profile", JSON.stringify(profile));
    localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
    localStorage.setItem("wm_onboarding_complete_v1", "1");
  }, E2E_VERIFIED_EMPLOYER_PROFILE);
}

/** Sync verified profile into piiSecureStorage mirror (required for canPublishJobPosts). */
export async function ensureVerifiedEmployerProfileOnPage(page: Page): Promise<void> {
  await page.evaluate(async (profile) => {
    const { employerSettingsStorage } =
      await import("/src/features/employer/company/storage/employerSettings.storage.ts");
    employerSettingsStorage.save({
      ...employerSettingsStorage.EMPTY_PROFILE,
      ...profile,
    });
  }, E2E_VERIFIED_EMPLOYER_PROFILE);
}
