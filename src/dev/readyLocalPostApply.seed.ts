/**
 * DEV only — unlock local employer publish + seed employee profile
 * for Phase-0 Shift/Career post → apply smoke testing.
 *
 * Does not bypass production gates; only writes local sealed profile fields.
 */

import { employeeProfileStorage } from "../features/employee/profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../features/employer/company/storage/employerSettings.storage";
import { canPublishJobPosts } from "../features/employer/company/helpers/employerVerificationPolicy.helpers";

export type ReadyLocalPostApplyResult = {
  readonly employerCompany: string;
  readonly employeeName: string;
  readonly publishAllowed: boolean;
  readonly publishReason?: string;
};

/** Sets business profile + contactVerified for employer; ensures employee has a name/city. */
export function applyReadyLocalPostApplySeed(): ReadyLocalPostApplyResult {
  const employer = employerSettingsStorage.savePartial({
    companyName: "Demo Hire Co",
    locationCity: "Kochi",
    locationState: "Kerala",
    locationPincode: "682001",
    industryType: "Hospitality",
    companySize: "11–50",
    companyDescription: "Local smoke-test employer (DEV).",
    fullName: "Demo Employer",
    email: "employer@demo.jobmitra.app",
    phone: "9876543210",
    contactVerified: true,
    verificationLevel: 1,
  });

  const existingEmployee = employeeProfileStorage.get();
  employeeProfileStorage.set({
    ...existingEmployee,
    fullName: existingEmployee.fullName.trim() || "Demo Worker",
    city: existingEmployee.city.trim() || "Kochi",
    basePincode: existingEmployee.basePincode || "682001",
    skills: existingEmployee.skills.length > 0 ? existingEmployee.skills : ["General"],
    experience: existingEmployee.experience || "fresher",
    preferShiftJobs: true,
    preferCareerJobs: true,
  });

  const gate = canPublishJobPosts(employerSettingsStorage.get());

  return {
    employerCompany: employer.companyName,
    employeeName: employeeProfileStorage.get().fullName,
    publishAllowed: gate.allowed,
    publishReason: gate.reason,
  };
}
