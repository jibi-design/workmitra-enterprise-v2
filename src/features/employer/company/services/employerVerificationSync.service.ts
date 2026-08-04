/** Sync employer verification maturity to server (Phase 0 publish gate). */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import type { EmployerProfile } from "../storage/employerSettings.storage";

const VERIFICATION_PATH = "/v1/jobmitra/employer/verification";

/**
 * Best-effort sync after local contact OTP / profile save.
 * No-op when AUTH backend is disabled (lab/localStorage mode).
 */
export async function syncEmployerVerificationToServer(
  profile: Pick<
    EmployerProfile,
    | "contactVerified"
    | "registrationNo"
    | "verificationAudit"
    | "verificationTrack"
    | "enterpriseTrack"
    | "microTrack"
  >,
): Promise<void> {
  if (!AUTH_BACKEND_ENABLED) return;

  try {
    await apiService.put(VERIFICATION_PATH, {
      contactVerified: profile.contactVerified === true,
      registrationNo: profile.registrationNo ?? "",
      verificationAuditStatus: profile.verificationAudit?.status ?? "none",
      verificationTrack: profile.verificationTrack ?? "none",
      enterpriseTrack: profile.enterpriseTrack,
      microTrack: profile.microTrack,
    });
  } catch {
    /* Fail-soft: local gate still applies; server gate uses last known / demo seed. */
  }
}
