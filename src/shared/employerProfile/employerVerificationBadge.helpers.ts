/** Worker-facing verification badge flags — identity vs star reputation. */

import { computeVerificationLevel } from "../../features/employer/company/helpers/employerIdentity.helpers";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { getEmployerBusinessKey } from "../../features/employer/company/helpers/employerDualId.helpers";
import { ratingStorage } from "../rating/ratingStorage";
import {
  calculateEmployerReputationTier,
  type EmployerReputationTier,
} from "./employerPublicProfileService";

export type EmployerVerificationBadgeKind =
  "contact_verified" | "verified_business" | "proven_reputation";

export type EmployerVerificationBadgeFlags = {
  readonly contactVerified: boolean;
  readonly verifiedBusiness: boolean;
  readonly provenReputation: boolean;
};

export const EMPLOYER_VERIFICATION_BADGE_LABELS: Record<EmployerVerificationBadgeKind, string> = {
  contact_verified: "Contact Verified",
  verified_business: "Verified Business",
  proven_reputation: "Proven Reputation",
};

export function resolveEmployerVerificationBadges(input: {
  readonly contactVerified?: boolean;
  readonly identityBusinessVerified?: boolean;
  readonly identityLevel?: 0 | 1 | 2 | 3;
  readonly reputationTier?: EmployerReputationTier;
}): EmployerVerificationBadgeFlags {
  const contactVerified =
    input.contactVerified === true ||
    (typeof input.identityLevel === "number" && input.identityLevel >= 1);
  const verifiedBusiness = input.identityBusinessVerified === true || input.identityLevel === 3;
  const provenReputation = input.reputationTier === "proven";

  return {
    contactVerified,
    verifiedBusiness,
    provenReputation,
  };
}

export function listActiveVerificationBadgeKinds(
  flags: EmployerVerificationBadgeFlags,
): EmployerVerificationBadgeKind[] {
  const out: EmployerVerificationBadgeKind[] = [];
  if (flags.contactVerified) out.push("contact_verified");
  if (flags.verifiedBusiness) out.push("verified_business");
  if (flags.provenReputation) out.push("proven_reputation");
  return out;
}

/**
 * Resolve worker-facing badges from the local employer profile (lab / single-tenant).
 * Used when public quick-info lookup by ML-ID is unavailable.
 */
export function resolveLocalEmployerVerificationFlags(): EmployerVerificationBadgeFlags {
  const profile = employerSettingsStorage.get();
  const identityLevel = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified,
    verificationAudit: profile.verificationAudit,
    verificationTrack: profile.verificationTrack,
    enterpriseTrack: profile.enterpriseTrack,
    microTrack: profile.microTrack,
  });
  const businessKey = getEmployerBusinessKey(profile);
  const ratingCount = businessKey ? ratingStorage.getEmployerSummary(businessKey).totalRatings : 0;
  const reputationTier = calculateEmployerReputationTier(ratingCount);

  return resolveEmployerVerificationBadges({
    contactVerified: profile.contactVerified === true || identityLevel >= 1,
    identityBusinessVerified: identityLevel === 3,
    identityLevel,
    reputationTier,
  });
}
