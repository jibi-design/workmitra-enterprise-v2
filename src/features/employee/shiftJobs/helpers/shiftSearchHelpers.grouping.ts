import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { APPS_KEY } from "./shiftSearchHelpers.storage";
import { isProfileComplete } from "./shiftSearchHelpers.applications";
import {
  applicationsContainBatchId,
  claimBatchActionLock,
  hasSeenApplyBatchId,
  markApplyBatchIdSeen,
  releaseBatchActionLock,
} from "../../../shared/planner/services/plannerConcurrency.service";
import { upsertAppIntoEmployerScope } from "../../../shared/shift/shiftTenantProjection";

export type PlanGroup = {
  key: string;
  planName: string;
  companyName: string;
  locationName: string;
  category: string;
  postIds: string[];
};

export function groupPostsByPlan(
  posts: {
    id: string;
    jobName: string;
    companyName: string;
    locationName: string;
    category: string;
  }[],
): PlanGroup[] {
  const map = new Map<string, PlanGroup>();

  for (const p of posts) {
    const key = `${p.jobName.trim().toLowerCase()}||${p.companyName.trim().toLowerCase()}`;
    const existing = map.get(key);

    if (existing) {
      existing.postIds.push(p.id);
    } else {
      map.set(key, {
        key,
        planName: p.jobName,
        companyName: p.companyName,
        locationName: p.locationName,
        category: p.category,
        postIds: [p.id],
      });
    }
  }

  return Array.from(map.values()).filter((g) => g.postIds.length >= 2);
}

export function multiApplyGroup(
  postIds: string[],
  meta?: { planId?: string; planApplyBatchId?: string; selectedDates?: string[] },
): number {
  if (!isProfileComplete()) return 0;

  const batchId = meta?.planApplyBatchId ?? `pb_${Date.now().toString(36)}`;

  // P2.2 — idempotent apply: same planApplyBatchId must not create a second batch.
  if (hasSeenApplyBatchId(batchId) || applicationsContainBatchId(batchId)) {
    return 0;
  }

  const claim = claimBatchActionLock(batchId, "apply");
  if (!claim.ok) return 0;

  try {
    const profile = employeeProfileStorage.get();
    const raw = localStorage.getItem(APPS_KEY);
    const existing: unknown[] = raw ? JSON.parse(raw) : [];

    const activeStatuses = new Set(["applied", "shortlisted", "waiting", "confirmed"]);

    const appliedPostIds = new Set(
      (existing as Record<string, unknown>[])
        .filter((a) => activeStatuses.has(a["status"] as string))
        .map((a) => a["postId"] as string),
    );

    const newApps: unknown[] = [];

    for (const postId of postIds) {
      if (appliedPostIds.has(postId)) continue;

      newApps.push({
        id: `app_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
        postId,
        createdAt: Date.now(),
        status: "applied",
        planId: meta?.planId,
        planApplyBatchId: batchId,
        selectedDates: meta?.selectedDates,
        profileSnapshot: {
          uniqueId: profile.uniqueId || undefined,
          fullName: profile.fullName.trim() || undefined,
          city: profile.city.trim() || undefined,
          experience: profile.experience || undefined,
          skills: profile.skills.length > 0 ? profile.skills : undefined,
          languages: profile.languages.length > 0 ? profile.languages : undefined,
        },
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
      });
    }

    if (newApps.length === 0) return 0;

    try {
      localStorage.setItem(APPS_KEY, JSON.stringify([...newApps, ...existing]));
      for (const app of newApps) {
        upsertAppIntoEmployerScope(app as Record<string, unknown>);
      }
      window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      markApplyBatchIdSeen(batchId);
      return newApps.length;
    } catch {
      return 0;
    }
  } finally {
    releaseBatchActionLock(batchId, "apply", claim.token);
  }
}
