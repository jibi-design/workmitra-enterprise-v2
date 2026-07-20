/** Mitra Labs — employer dual-ID resolution (owner private + business org public). */

import type { EmployerProfile } from "../storage/employerSettings.storage";

export function getEmployerOrgId(profile: EmployerProfile): string | undefined {
  const orgId = profile.employerOrgId?.trim();
  if (orgId) return orgId;

  const legacy = profile.companyUniqueId?.trim() || profile.uniqueId?.trim();
  return legacy || undefined;
}

/** Stable business org key for ratings, posts, and audit. */
export function getEmployerBusinessKey(profile: EmployerProfile): string | undefined {
  return getEmployerOrgId(profile);
}

/** @deprecated Use getEmployerBusinessKey — legacy alias for job-post ML display id. */
export function getEmployerCompanyId(profile: EmployerProfile): string | undefined {
  const mlId = profile.companyUniqueId?.trim() || profile.uniqueId?.trim();
  return mlId || getEmployerOrgId(profile);
}

/** Owner personal account — private; auth, settings, billing. */
export function getEmployerOwnerId(profile: EmployerProfile): string | undefined {
  const id = profile.ownerUserId?.trim() || profile.ownerUniqueId?.trim();
  return id || undefined;
}
