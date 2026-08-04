/**
 * Employer maturity / publish gate — shared by Shift, Career, and Planner.
 * Server-owned; never trust client-supplied maturity for authorization.
 */

export type EmployerMaturityStage =
  "unverified" | "contact_verified" | "document_submitted" | "verified_business";

export type EmployerVerificationAuditStatus = "none" | "pending" | "approved" | "rejected";

export type EmployerVerificationTrackKind = "none" | "enterprise" | "micro";

export type EnterpriseTrackPayload = {
  readonly companiesHouseCrn: string;
  readonly vatId: string;
  readonly registeredAddress: string;
  readonly corporateEmail: string;
  readonly corporateDomain: string;
  readonly submittedAt?: number;
};

export type MicroTrackPayload = {
  readonly ownerGovIdAttested: boolean;
  readonly ownerGovIdRef: string;
  readonly tradeProofAttested: boolean;
  readonly tradeProofNote: string;
  readonly gpsProofAttested: boolean;
  readonly gpsLat: string;
  readonly gpsLng: string;
  readonly locationProofNote: string;
  readonly submittedAt?: number;
};

export type EmployerVerificationRecord = {
  readonly employerUserId: string;
  readonly contactVerified: boolean;
  readonly registrationNo: string;
  readonly verificationAuditStatus: EmployerVerificationAuditStatus;
  readonly verificationTrack: EmployerVerificationTrackKind;
  readonly enterpriseTrack?: EnterpriseTrackPayload;
  readonly microTrack?: MicroTrackPayload;
  readonly updatedAt: number;
};

export type PublishGateDenial = {
  readonly ok: false;
  readonly code: "VERIFICATION_REQUIRED";
  readonly reason: "VERIFICATION_REQUIRED";
  readonly message: string;
  readonly httpStatus: 403;
  readonly maturityStage: EmployerMaturityStage;
};

export type PublishGateAllow = {
  readonly ok: true;
  readonly maturityStage: EmployerMaturityStage;
};

export type PublishGateResult = PublishGateAllow | PublishGateDenial;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "mail.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

function extractEmailDomain(email: string): string {
  const part = email.trim().toLowerCase().split("@")[1] ?? "";
  return part.replace(/^www\./, "");
}

export function isCorporateDomainEmailMatch(email: string, declaredDomain?: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return false;
  const declared = (declaredDomain ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/^www\./, "");
  if (!declared) return true;
  return domain === declared || domain.endsWith(`.${declared}`);
}

export function isEnterpriseTrackComplete(track: EnterpriseTrackPayload | undefined): boolean {
  if (!track) return false;
  const crn = track.companiesHouseCrn.trim();
  const vat = track.vatId.trim();
  const address = track.registeredAddress.trim();
  const email = track.corporateEmail.trim();
  if (!crn || !vat || !address || !email) return false;
  return isCorporateDomainEmailMatch(email, track.corporateDomain);
}

export function isMicroTrackComplete(track: MicroTrackPayload | undefined): boolean {
  if (!track) return false;
  if (!track.ownerGovIdAttested) return false;
  const hasTrade = track.tradeProofAttested && Boolean(track.tradeProofNote.trim());
  const hasGps =
    track.gpsProofAttested &&
    (Boolean(track.locationProofNote.trim()) ||
      (Boolean(track.gpsLat.trim()) && Boolean(track.gpsLng.trim())));
  return hasTrade || hasGps;
}

export function hasDocumentEvidence(
  record: Pick<
    EmployerVerificationRecord,
    "registrationNo" | "verificationTrack" | "enterpriseTrack" | "microTrack"
  >,
): boolean {
  if (record.registrationNo.trim()) return true;
  if (record.verificationTrack === "enterprise") {
    return isEnterpriseTrackComplete(record.enterpriseTrack);
  }
  if (record.verificationTrack === "micro") {
    return isMicroTrackComplete(record.microTrack);
  }
  return (
    isEnterpriseTrackComplete(record.enterpriseTrack) || isMicroTrackComplete(record.microTrack)
  );
}

/**
 * Contact verification is required before registration/document credit.
 * Dual tracks or legacy registrationNo count as document evidence.
 */
export function resolveMaturityStage(
  record: Pick<
    EmployerVerificationRecord,
    | "contactVerified"
    | "registrationNo"
    | "verificationAuditStatus"
    | "verificationTrack"
    | "enterpriseTrack"
    | "microTrack"
  >,
): EmployerMaturityStage {
  const contact = record.contactVerified === true;
  const hasDocs = hasDocumentEvidence(record);
  const approved = record.verificationAuditStatus === "approved";

  if (contact && hasDocs && approved) return "verified_business";
  if (contact && hasDocs) return "document_submitted";
  if (contact) return "contact_verified";
  return "unverified";
}

/** Live publish allowed at contact_verified and above (includes verified_business). */
export function canPublishLive(stage: EmployerMaturityStage): boolean {
  return (
    stage === "contact_verified" || stage === "document_submitted" || stage === "verified_business"
  );
}

export function assertCanPublishLive(
  record: Pick<
    EmployerVerificationRecord,
    | "contactVerified"
    | "registrationNo"
    | "verificationAuditStatus"
    | "verificationTrack"
    | "enterpriseTrack"
    | "microTrack"
  >,
): PublishGateResult {
  const maturityStage = resolveMaturityStage(record);
  if (!canPublishLive(maturityStage)) {
    return {
      ok: false,
      code: "VERIFICATION_REQUIRED",
      reason: "VERIFICATION_REQUIRED",
      message: "Verify your phone or email before publishing live Shift, Career, or Planner posts.",
      httpStatus: 403,
      maturityStage,
    };
  }
  return { ok: true, maturityStage };
}

export function isLiveShiftStatus(status: string): boolean {
  return status === "active";
}

export function isLiveCareerStatus(status: string): boolean {
  return status === "published";
}

export function isLivePlannerStatus(status: string): boolean {
  return status === "active";
}
