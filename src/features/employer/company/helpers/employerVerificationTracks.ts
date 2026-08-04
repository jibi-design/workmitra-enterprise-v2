/** Dual verification track types — Enterprise vs Micro/Trade. */

export type EmployerVerificationTrackKind = "none" | "enterprise" | "micro";

/** Track A — Registered enterprise (UK/Global). */
export type EnterpriseVerificationTrack = {
  readonly companiesHouseCrn: string;
  readonly vatId: string;
  readonly registeredAddress: string;
  /** Corporate email used for domain match (defaults to account email when empty). */
  readonly corporateEmail: string;
  /** Optional declared company domain (e.g. acme.co.uk). */
  readonly corporateDomain: string;
  readonly submittedAt?: number;
};

/** Track B — Micro / local trade (no CRN required). */
export type MicroVerificationTrack = {
  /** Owner government photo ID attested on device (Phase 1: attestation, not binary upload). */
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

export const EMPTY_ENTERPRISE_TRACK: EnterpriseVerificationTrack = {
  companiesHouseCrn: "",
  vatId: "",
  registeredAddress: "",
  corporateEmail: "",
  corporateDomain: "",
};

export const EMPTY_MICRO_TRACK: MicroVerificationTrack = {
  ownerGovIdAttested: false,
  ownerGovIdRef: "",
  tradeProofAttested: false,
  tradeProofNote: "",
  gpsProofAttested: false,
  gpsLat: "",
  gpsLng: "",
  locationProofNote: "",
};

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

export function extractEmailDomain(email: string): string {
  const part = email.trim().toLowerCase().split("@")[1] ?? "";
  return part.replace(/^www\./, "");
}

/** Corporate domain email match — non-free mailbox; optional declared domain equality. */
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

export function isEnterpriseTrackComplete(track: EnterpriseVerificationTrack | undefined): boolean {
  if (!track) return false;
  const crn = track.companiesHouseCrn.trim();
  const vat = track.vatId.trim();
  const address = track.registeredAddress.trim();
  const email = track.corporateEmail.trim();
  if (!crn || !vat || !address || !email) return false;
  return isCorporateDomainEmailMatch(email, track.corporateDomain);
}

export function isMicroTrackComplete(track: MicroVerificationTrack | undefined): boolean {
  if (!track) return false;
  if (!track.ownerGovIdAttested) return false;
  const hasTrade = track.tradeProofAttested && Boolean(track.tradeProofNote.trim());
  const hasGps =
    track.gpsProofAttested &&
    (Boolean(track.locationProofNote.trim()) ||
      (Boolean(track.gpsLat.trim()) && Boolean(track.gpsLng.trim())));
  return hasTrade || hasGps;
}

export function hasDocumentEvidence(input: {
  readonly registrationNo?: string;
  readonly verificationTrack?: EmployerVerificationTrackKind;
  readonly enterpriseTrack?: EnterpriseVerificationTrack;
  readonly microTrack?: MicroVerificationTrack;
}): boolean {
  if (input.registrationNo?.trim()) return true;
  if (input.verificationTrack === "enterprise") {
    return isEnterpriseTrackComplete(input.enterpriseTrack);
  }
  if (input.verificationTrack === "micro") {
    return isMicroTrackComplete(input.microTrack);
  }
  return isEnterpriseTrackComplete(input.enterpriseTrack) || isMicroTrackComplete(input.microTrack);
}
