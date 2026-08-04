/** Employer 3-layer identity helpers — pure functions, no storage imports. */

import { ID_CHARSET } from "../../../../shared/identity/constants/idConstants";
import type {
  EmployerVerificationLevel,
  EmployerVerificationAudit,
  PublicHandleProfileSlice,
  VerificationProfileSlice,
} from "./employerIdentity.types";
import { hasDocumentEvidence } from "./employerVerificationTracks";

export type { EmployerTransferStatus, EmployerVerificationLevel } from "./employerIdentity.types";

const HANDLE_MAX_LEN = 48;

export function generateEmployerOrgId(): string {
  let suffix = "";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    suffix += ID_CHARSET[bytes[i] % ID_CHARSET.length];
  }
  return `emporg_${suffix.toLowerCase()}`;
}

export function slugifyPublicHandle(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, HANDLE_MAX_LEN);

  return slug || "my-business";
}

export function getPublicProfilePath(handle: string): string {
  const safe = handle.trim() || "my-business";
  return `jobmitra.app/business/${safe}`;
}

export function computeVerificationLevel(
  profile: VerificationProfileSlice,
): EmployerVerificationLevel {
  const contact = profile.contactVerified === true;
  const hasDocs = hasDocumentEvidence(profile);
  const approved = profile.verificationAudit?.status === "approved";

  // Contact verification must precede registration/document credit.
  if (contact && hasDocs && approved) return 3;
  if (contact && hasDocs) return 2;
  if (contact) return 1;
  return 0;
}

export function syncVerificationAudit(
  existing: EmployerVerificationAudit | undefined,
  registrationNo: string,
  hasDocs?: boolean,
): EmployerVerificationAudit {
  const evidence = hasDocs === undefined ? Boolean(registrationNo.trim()) : hasDocs;
  const current = existing ?? { status: "none" as const };

  if (!evidence) {
    return { status: "none" };
  }
  if (current.status === "approved" || current.status === "pending") {
    return current;
  }
  if (current.status === "rejected") {
    return { status: "pending", submittedAt: Date.now() };
  }
  return { status: "pending", submittedAt: Date.now() };
}

export const VERIFICATION_LEVEL_LABELS: Record<EmployerVerificationLevel, string> = {
  0: "Unverified business",
  1: "Phone or email verified",
  2: "Business document submitted",
  3: "Verified business",
};

export function resolvePublicHandle(profile: PublicHandleProfileSlice): string {
  return profile.publicHandle?.trim() || slugifyPublicHandle(profile.companyName) || "my-business";
}
