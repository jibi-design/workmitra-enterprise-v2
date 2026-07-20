/** Employer verification policy — progressive trust gates (Phase 0). */

import { employerSettingsStorage } from "../storage/employerSettings.storage";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import { computeVerificationLevel } from "./employerIdentity.helpers";

export const MIN_LEVEL_TO_PUBLISH_POSTS = 1 as const;

export type VerificationGateResult = {
  readonly allowed: boolean;
  readonly reason?: string;
};

export function getEmployerVerificationLevel(profile?: EmployerProfile): number {
  const p = profile ?? employerSettingsStorage.get();
  return computeVerificationLevel({
    registrationNo: p.registrationNo,
    contactVerified: p.contactVerified,
    verificationAudit: p.verificationAudit,
  });
}

export function hasActiveBusinessProfile(profile: EmployerProfile): boolean {
  return Boolean(
    profile.companyName.trim() && (profile.locationCity.trim() || profile.locationState.trim()),
  );
}

export function canPublishJobPosts(profile: EmployerProfile): VerificationGateResult {
  if (!hasActiveBusinessProfile(profile)) {
    return {
      allowed: false,
      reason:
        "Complete your business name and location on Employer Profile before publishing job posts.",
    };
  }

  const level = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified,
    verificationAudit: profile.verificationAudit,
  });
  if (level >= MIN_LEVEL_TO_PUBLISH_POSTS) {
    return { allowed: true };
  }

  const hasContact = Boolean(profile.phone.trim() || profile.email.trim());
  if (!hasContact) {
    return {
      allowed: false,
      reason:
        "Add your phone or email under Your account, then verify contact in the Verification section.",
    };
  }

  return {
    allowed: false,
    reason:
      "Verify your phone or email in Employer Profile → Verification before publishing job posts.",
  };
}

export function canShowVerifiedBadge(profile: EmployerProfile): boolean {
  return (
    computeVerificationLevel({
      registrationNo: profile.registrationNo,
      contactVerified: profile.contactVerified,
      verificationAudit: profile.verificationAudit,
    }) === 3
  );
}
