/**
 * Job Mitra | plannerEmployerAutofill.ts
 * P-SEP-3 — employer planner autofill from company settings (not Shift create helper).
 */

import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";

export type PlannerEmployerAutofill = {
  companyName: string;
  industryType: string;
  locationCity: string;
  locationPincode: string;
};

export function getPlannerEmployerAutofill(): PlannerEmployerAutofill {
  const profile = employerSettingsStorage.get();
  return {
    companyName: profile.companyName || "",
    industryType: profile.industryType || "",
    locationCity: profile.locationCity || "",
    locationPincode: profile.locationPincode || "",
  };
}
