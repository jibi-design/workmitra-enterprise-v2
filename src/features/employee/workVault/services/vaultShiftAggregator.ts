// src/features/employee/workVault/services/vaultShiftAggregator.ts
//
// Reads Shift Jobs data from localStorage and returns
// structured Work Vault sections: Shift Stats + Ratings + References.
// No writes — pure read-only aggregation.

import type { VaultReference } from "../types/vaultProfileTypes";

// ─────────────────────────────────────────────────────────────────────────────
// localStorage Keys (read-only — owned by Shift domain)
// ─────────────────────────────────────────────────────────────────────────────

const SHIFT_POSTS_KEY = "wm_employer_shift_posts_v1";
const SHIFT_APPS_KEY = "wm_employee_shift_applications_v1";
const SHIFT_WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

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
// Shift Stats (Section 4 — shift portion)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateShiftStats(): {
  totalShiftsCompleted: number;
  uniqueCompanies: string[];
} {
  const workspaces = parse<Rec>(SHIFT_WORKSPACES_KEY);

  const completed = workspaces.filter(
    (w) => str(w, "status") === "completed" || str(w, "status") === "active"
  );

  const companies = new Set<string>();
  for (const w of completed) {
    const name = str(w, "companyName").toLowerCase().trim();
    if (name) companies.add(name);
  }

  return {
    totalShiftsCompleted: completed.length,
    uniqueCompanies: Array.from(companies),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shift Ratings (Section 7 — shift portion)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateShiftRatings(): {
  ratings: number[];
  ratedCompanies: { companyName: string; rating: number }[];
} {
  const apps = parse<Rec>(SHIFT_APPS_KEY);
  const posts = parse<Rec>(SHIFT_POSTS_KEY);

  const postMap = new Map<string, Rec>();
  for (const p of posts) {
    const id = str(p, "id");
    if (id) postMap.set(id, p);
  }

  const ratings: number[] = [];
  const ratedCompanies: { companyName: string; rating: number }[] = [];

  for (const app of apps) {
    const rating = num(app, "rating");
    if (rating >= 1 && rating <= 5) {
      ratings.push(rating);
      const post = postMap.get(str(app, "postId"));
      const companyName = post ? str(post, "companyName") : "";
      if (companyName) {
        ratedCompanies.push({ companyName, rating });
      }
    }
  }

  return { ratings, ratedCompanies };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shift References (Section 8 — employers who rated 4+)
// ─────────────────────────────────────────────────────────────────────────────

export function aggregateShiftReferences(): VaultReference[] {
  const { ratedCompanies } = aggregateShiftRatings();

  const seen = new Set<string>();
  const refs: VaultReference[] = [];

  for (const entry of ratedCompanies) {
    const key = entry.companyName.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      refs.push({
        companyName: entry.companyName,
        rating: entry.rating,
        source: "shift",
      });
    }
  }

  return refs;
}