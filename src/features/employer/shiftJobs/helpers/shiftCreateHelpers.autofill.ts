import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

export type AutoFillData = {
  companyName: string;
  industryType: string;
  locationCity: string;
};

export function getAutoFillData(): AutoFillData {
  const profile = employerSettingsStorage.get();

  return {
    companyName: profile.companyName || "",
    industryType: profile.industryType || "",
    locationCity: profile.locationCity || "",
  };
}
