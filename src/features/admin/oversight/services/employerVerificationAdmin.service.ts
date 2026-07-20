/** Admin actions for employer business verification (Phase 0 — local). */

import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { computeVerificationLevel } from "../../../employer/company/helpers/employerIdentity.helpers";

const ADMIN_REVIEWER = "admin_demo";

export type AdminVerificationReviewResult =
  { readonly success: true } | { readonly success: false; readonly reason: string };

export type EmployerVerificationQueueItem = {
  readonly employerOrgId: string;
  readonly companyName: string;
  readonly registrationNo: string;
  readonly ownerName: string;
  readonly submittedAt?: number;
  readonly level: number;
  readonly auditStatus: string;
};

export function getEmployerVerificationQueue(): EmployerVerificationQueueItem[] {
  const profile = employerSettingsStorage.get();
  if (!profile.companyName.trim() || !profile.registrationNo.trim()) {
    return [];
  }

  const audit = profile.verificationAudit;
  if (audit?.status === "approved") {
    return [];
  }

  return [
    {
      employerOrgId: profile.employerOrgId ?? profile.uniqueId ?? "local_employer",
      companyName: profile.companyName,
      registrationNo: profile.registrationNo,
      ownerName: profile.fullName,
      submittedAt: audit?.submittedAt,
      level: computeVerificationLevel({
        registrationNo: profile.registrationNo,
        contactVerified: profile.contactVerified,
        verificationAudit: audit,
      }),
      auditStatus: audit?.status ?? "pending",
    },
  ];
}

export function approveEmployerVerification(reviewNote: string): AdminVerificationReviewResult {
  const profile = employerSettingsStorage.get();
  if (!profile.registrationNo.trim()) {
    return { success: false, reason: "No registration number on file." };
  }

  const now = Date.now();
  employerSettingsStorage.savePartial({
    verificationAudit: {
      status: "approved",
      submittedAt: profile.verificationAudit?.submittedAt ?? now,
      reviewedAt: now,
      reviewedBy: ADMIN_REVIEWER,
      reviewNote: reviewNote.trim() || "Approved by admin review.",
    },
    verificationLevel: 3,
  });

  return { success: true };
}

export function rejectEmployerVerification(reviewNote: string): AdminVerificationReviewResult {
  const profile = employerSettingsStorage.get();
  if (!profile.registrationNo.trim()) {
    return { success: false, reason: "No registration number on file." };
  }

  const now = Date.now();
  employerSettingsStorage.savePartial({
    verificationAudit: {
      status: "rejected",
      submittedAt: profile.verificationAudit?.submittedAt ?? now,
      reviewedAt: now,
      reviewedBy: ADMIN_REVIEWER,
      reviewNote: reviewNote.trim() || "Rejected by admin review.",
    },
    verificationLevel: 2,
  });

  return { success: true };
}

export function revokeEmployerVerification(reviewNote: string): AdminVerificationReviewResult {
  const profile = employerSettingsStorage.get();
  if (profile.verificationAudit?.status !== "approved") {
    return { success: false, reason: "Business is not currently verified." };
  }

  const now = Date.now();
  employerSettingsStorage.savePartial({
    verificationAudit: {
      status: "rejected",
      submittedAt: profile.verificationAudit?.submittedAt,
      reviewedAt: now,
      reviewedBy: ADMIN_REVIEWER,
      reviewNote: reviewNote.trim() || "Verification revoked by admin.",
    },
    verificationLevel: 2,
  });

  return { success: true };
}

export function isEmployerVerifiedBusiness(): boolean {
  const profile = employerSettingsStorage.get();
  return (
    computeVerificationLevel({
      registrationNo: profile.registrationNo,
      contactVerified: profile.contactVerified,
      verificationAudit: profile.verificationAudit,
    }) === 3
  );
}
