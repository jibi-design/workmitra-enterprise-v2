// App: Job Mitra / WorkMitra_Enterprise_v2
// File: employerPublicIdentity.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\helpers\employerPublicIdentity.ts

import { employerSettingsStorage } from "../storage/employerSettings.storage";
import { getEmployerCompanyId } from "./employerDualId.helpers";

export function getCurrentEmployerMlId(): string {
  return getEmployerCompanyId(employerSettingsStorage.get()) ?? "";
}
