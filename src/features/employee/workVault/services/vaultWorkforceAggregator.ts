// src/features/employee/workVault/services/vaultWorkforceAggregator.ts
//
// Reads Workforce Ops data from localStorage and returns
// structured Work Vault sections: Workforce Stats + Ratings + Attendance + References.
// No writes — pure read-only aggregation.

import type { VaultReference } from "../types/vaultProfileTypes";

// ─────────────────────────────────────────────────────────────────────────────
// localStorage Keys (read-only — owned by Workforce domain)
// ─────────────────────────────────────────────────────────────────────────────

const WF_STAFF_KEY = "wm_workforce_staff_v1";
const WF_MEMBERS_KEY = "wm_workforce_members_v1";
const WF_ATTENDANCE_KEY = "wm_workforce_attendance_v1";
const WF_ANNOUNCEMENTS_KEY = "wm_workforce_announcements_v1";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;

function parse<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch {
    return [];
  }
}

function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

function num(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workforce Stats (Section 4 — workforce portion)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateWorkforceStats(): {
  totalWorkforceCompanies: number;
  totalGroupsParticipated: number;
} {
  const members = parse<Rec>(WF_MEMBERS_KEY);
  const announcements = parse<Rec>(WF_ANNOUNCEMENTS_KEY);

  // Count unique groups employee participated in
  const participatedGroupIds = new Set<string>();
  for (const m of members) {
    if (str(m, "status") === "active" || str(m, "status") === "exited") {
      participatedGroupIds.add(str(m, "groupId"));
    }
  }

  // Workforce is employer-side, so "companies" = unique employers
  // In Phase-0 demo there's typically one employer, but we count announcements as proxy
  const companyNames = new Set<string>();
  for (const a of announcements) {
    const title = str(a, "title").toLowerCase().trim();
    if (title) companyNames.add(title);
  }

  return {
    totalWorkforceCompanies: Math.max(companyNames.size, participatedGroupIds.size > 0 ? 1 : 0),
    totalGroupsParticipated: participatedGroupIds.size,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Workforce Ratings (Section 7 — workforce portion)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateWorkforceRatings(): {
  ratings: number[];
  staffRating: number | null;
  staffRatingCount: number;
} {
  const staff = parse<Rec>(WF_STAFF_KEY);
  const members = parse<Rec>(WF_MEMBERS_KEY);

  // Post-event ratings from group members
  const memberRatings: number[] = [];
  for (const m of members) {
    const rating = num(m, "postEventRating");
    if (rating >= 1 && rating <= 5) {
      memberRatings.push(rating);
    }
  }

  // Staff-level rating (employer's overall rating of this employee)
  let staffRating: number | null = null;
  let staffRatingCount = 0;

  for (const s of staff) {
    const rating = num(s, "rating");
    const count = num(s, "ratingCount");
    if (rating > 0) {
      staffRating = rating;
      staffRatingCount = count;
      break; // Phase-0: one employer = one staff entry
    }
  }

  return {
    ratings: memberRatings,
    staffRating,
    staffRatingCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Rate (Section 7)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateAttendanceRate(): number | null {
  const members = parse<Rec>(WF_MEMBERS_KEY);
  const attendance = parse<Rec>(WF_ATTENDANCE_KEY);

  if (members.length === 0) return null;

  // Total assigned shifts across all groups
  let totalAssigned = 0;
  for (const m of members) {
    const shifts = m["assignedShiftIds"];
    if (Array.isArray(shifts)) {
      totalAssigned += shifts.length;
    }
  }

  if (totalAssigned === 0) return null;

  // Signed-in shifts
  const signedIn = attendance.filter((a) => num(a, "signInAt") > 0).length;

  return Math.round((signedIn / totalAssigned) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reliability Score (Section 7)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateReliabilityScore(): number | null {
  const members = parse<Rec>(WF_MEMBERS_KEY);

  if (members.length === 0) return null;

  const total = members.length;
  const exited = members.filter(
    (m) => str(m, "status") === "exited"
  ).length;

  const reliable = total - exited;
  return Math.round((reliable / total) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Workforce References (Section 8 — staff rated 4+)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateWorkforceReferences(): VaultReference[] {
  const staff = parse<Rec>(WF_STAFF_KEY);
  const refs: VaultReference[] = [];

  for (const s of staff) {
    const rating = num(s, "rating");
    if (rating > 0) {
      refs.push({
        companyName: "Workforce Employer",
        rating,
        source: "workforce",
      });
    }
  }

  return refs;
}