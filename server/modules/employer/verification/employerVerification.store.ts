/**
 * In-memory employer verification store (Phase 0/1).
 * Lab demo employers are contact_verified so Shift/Career/Planner publish stays unblocked
 * after API restart (memory ids + DB UUIDs resolved by email).
 */

import { isProduction } from "../../auth/env.js";
import type {
  EmployerVerificationAuditStatus,
  EmployerVerificationRecord,
  EmployerVerificationTrackKind,
  EnterpriseTrackPayload,
  MicroTrackPayload,
} from "./employerMaturity.policy.js";

const store = new Map<string, EmployerVerificationRecord>();

export const DEMO_EMPLOYER_EMAILS = [
  "employer@demo.jobmitra.app",
  "employer-b@demo.jobmitra.app",
] as const;

const DEMO_EMPLOYER_MEMORY_IDS = ["usr_employer_demo", "usr_employer_b_demo"] as const;

function labDemoSeedAllowed(): boolean {
  return !isProduction();
}

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

function writeContactVerified(employerUserId: string): void {
  const now = Date.now();
  const current = store.get(employerUserId);
  store.set(employerUserId, {
    ...(current ?? emptyRecord(employerUserId)),
    employerUserId,
    contactVerified: true,
    updatedAt: now,
  });
}

function seedDemoEmployers(): void {
  if (!labDemoSeedAllowed()) return;
  for (const id of DEMO_EMPLOYER_MEMORY_IDS) {
    writeContactVerified(id);
  }
}

seedDemoEmployers();

/** Marks lab demo employers contact-verified (memory ids or demo emails). No-op in production. */
export function markLabDemoEmployerVerified(employerUserId: string, email?: string): void {
  if (!labDemoSeedAllowed() || !employerUserId.trim()) return;
  const normalized = (email ?? "").trim().toLowerCase();
  const knownId = (DEMO_EMPLOYER_MEMORY_IDS as readonly string[]).includes(employerUserId);
  const knownEmail = (DEMO_EMPLOYER_EMAILS as readonly string[]).includes(normalized);
  if (!knownId && !knownEmail) return;
  writeContactVerified(employerUserId);
}

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
