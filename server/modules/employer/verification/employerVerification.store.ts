/**
 * In-memory employer verification store (Phase 0/1).
 * Demo employers are seeded contact_verified so lab API suites remain publish-capable.
 */

import { isDemoAuthAllowed } from "../../auth/env.js";
import type {
  EmployerVerificationAuditStatus,
  EmployerVerificationRecord,
  EmployerVerificationTrackKind,
  EnterpriseTrackPayload,
  MicroTrackPayload,
} from "./employerMaturity.policy.js";

const store = new Map<string, EmployerVerificationRecord>();

function emptyRecord(employerUserId: string): EmployerVerificationRecord {
  return {
    employerUserId,
    contactVerified: false,
    registrationNo: "",
    verificationAuditStatus: "none",
    verificationTrack: "none",
    updatedAt: Date.now(),
  };
}

function seedDemoEmployers(): void {
  if (!isDemoAuthAllowed()) return;
  const now = Date.now();
  for (const id of ["usr_employer_demo", "usr_employer_b_demo"]) {
    store.set(id, {
      employerUserId: id,
      contactVerified: true,
      registrationNo: "",
      verificationAuditStatus: "none",
      verificationTrack: "none",
      updatedAt: now,
    });
  }
}

seedDemoEmployers();

export type EmployerVerificationUpsertPatch = {
  contactVerified?: boolean;
  registrationNo?: string;
  verificationAuditStatus?: EmployerVerificationAuditStatus;
  verificationTrack?: EmployerVerificationTrackKind;
  enterpriseTrack?: EnterpriseTrackPayload;
  microTrack?: MicroTrackPayload;
};

export const employerVerificationStore = {
  get(employerUserId: string): EmployerVerificationRecord {
    return store.get(employerUserId) ?? emptyRecord(employerUserId);
  },

  upsert(
    employerUserId: string,
    patch: EmployerVerificationUpsertPatch,
  ): EmployerVerificationRecord {
    const current = employerVerificationStore.get(employerUserId);
    const next: EmployerVerificationRecord = {
      employerUserId,
      contactVerified:
        typeof patch.contactVerified === "boolean"
          ? patch.contactVerified
          : current.contactVerified,
      registrationNo:
        typeof patch.registrationNo === "string"
          ? patch.registrationNo.trim()
          : current.registrationNo,
      verificationAuditStatus: patch.verificationAuditStatus ?? current.verificationAuditStatus,
      verificationTrack: patch.verificationTrack ?? current.verificationTrack,
      enterpriseTrack: patch.enterpriseTrack ?? current.enterpriseTrack,
      microTrack: patch.microTrack ?? current.microTrack,
      updatedAt: Date.now(),
    };
    store.set(employerUserId, next);
    return next;
  },

  /** Test helper — clears non-demo state. */
  _resetForTests(): void {
    store.clear();
    seedDemoEmployers();
  },
};
