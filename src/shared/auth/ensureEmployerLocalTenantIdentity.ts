/**
 * Ensure local employer business identity exists for dual-context AUTH sessions.
 * Career/Shift tenant scope keys require employerOrgId — without it employer shell crashes.
 */

import { getEmployerOrgId } from "../../features/employer/company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import type { UserProfile } from "../store/authStore";

function stableOrgFromUserId(userId: string): string {
  const cleaned = userId.trim().replace(/[^a-zA-Z0-9]/g, "_").slice(0, 28);
  return cleaned ? `emporg_u_${cleaned}` : "emporg_u_local";
}

/**
 * Returns a usable employer org id, seeding wm_employer_profile_v1 when missing.
 * Prefer existing profile → session activeOrgId → stable user-derived id.
 */
export function ensureEmployerLocalTenantIdentity(user: UserProfile | null | undefined): string | null {
  if (!user) return null;

  const profile = employerSettingsStorage.get();
  const existing = getEmployerOrgId(profile)?.trim();
  if (existing) return existing;

  const fromSession = user.activeOrgId?.trim();
  const orgId = fromSession || stableOrgFromUserId(user.id);

  employerSettingsStorage.savePartial({
    employerOrgId: orgId,
    companyUniqueId: profile.companyUniqueId?.trim() || orgId,
    uniqueId: profile.uniqueId?.trim() || orgId,
    companyName: profile.companyName?.trim() || "My Company",
    ownerUserId: profile.ownerUserId?.trim() || user.id,
  });

  return orgId;
}
