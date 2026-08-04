/** Employer identity types — no storage imports (avoids circular deps). */

import type {
  EmployerVerificationTrackKind,
  EnterpriseVerificationTrack,
  MicroVerificationTrack,
} from "./employerVerificationTracks";

export type EmployerVerificationLevel = 0 | 1 | 2 | 3;
export type EmployerTransferStatus = "none" | "pending" | "completed" | "cancelled";
export type EmployerVerificationAuditStatus = "none" | "pending" | "approved" | "rejected";

export type EmployerVerificationAudit = {
  readonly status: EmployerVerificationAuditStatus;
  readonly submittedAt?: number;
  readonly reviewedAt?: number;
  readonly reviewedBy?: string;
  readonly reviewNote?: string;
};

export type EmployerPendingTransfer = {
  readonly code: string;
  readonly toOwnerName: string;
  readonly toOwnerEmail: string;
  readonly toOwnerPhone: string;
  readonly reason: string;
  readonly initiatedAt: number;
  readonly expiresAt: number;
};

export type OwnershipAuditEntry = {
  readonly id: string;
  readonly fromOwnerUserId: string;
  readonly fromOwnerName: string;
  readonly toOwnerUserId: string;
  readonly toOwnerName: string;
  readonly timestamp: number;
  readonly reason: string;
};

export type VerificationProfileSlice = {
  readonly registrationNo: string;
  readonly contactVerified?: boolean;
  readonly verificationAudit?: EmployerVerificationAudit;
  readonly verificationTrack?: EmployerVerificationTrackKind;
  readonly enterpriseTrack?: EnterpriseVerificationTrack;
  readonly microTrack?: MicroVerificationTrack;
};

export type PublicHandleProfileSlice = {
  readonly companyName: string;
  readonly publicHandle?: string;
};

export type { EmployerVerificationTrackKind, EnterpriseVerificationTrack, MicroVerificationTrack };
