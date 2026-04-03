// src/features/employee/shiftJobs/storage/earningsStorage.ts
//
// Earnings Tracker — computes worker earnings from confirmed shift applications.
// Reads from existing shiftApplications.storage (no new keys).
// Earnings = confirmed apps × (payPerDay × days in shift).

import { shiftApplicationsStorage } from "./shiftApplications.storage";
import type { ShiftPostData } from "../types/shiftApplicationTypes";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type EarningEntry = {
  appId: string;
  postId: string;
  companyName: string;
  jobName: string;
  locationName: string;
  startAt: number;
  endAt: number;
  payPerDay: number;
  totalDays: number;
  totalEarned: number;
  category: string;
};

export type EarningsSummary = {
  totalEarned: number;
  totalShifts: number;
  totalDays: number;
  avgPerShift: number;
  avgPerDay: number;
  byMonth: { label: string; earned: number; shifts: number }[];
  byWeek:  { label: string; earned: number; shifts: number }[];
  byCompany: { name: string; earned: number; shifts: number }[];
  entries: EarningEntry[];
};

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function countDays(startAt: number, endAt: number): number {
  const ms = endAt - startAt;
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

function monthLabel(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  } catch { return "Unknown"; }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const earningsStorage = {
  getSummary(): EarningsSummary {
    const apps   = shiftApplicationsStorage.getApps();
    const posts  = shiftApplicationsStorage.getPosts();
    const postMap = new Map<string, ShiftPostData>(posts.map((p) => [p.id, p]));

    const confirmed = apps.filter((a) => a.status === "confirmed");

    const entries: EarningEntry[] = [];
    for (const app of confirmed) {
      const post = postMap.get(app.postId);
      if (!post) continue;
      const totalDays   = countDays(post.startAt, post.endAt);
      const totalEarned = post.payPerDay * totalDays;
      entries.push({
        appId:       app.id,
        postId:      post.id,
        companyName: post.companyName,
        jobName:     post.jobName,
        locationName: post.locationName,
        startAt:     post.startAt,
        endAt:       post.endAt,
        payPerDay:   post.payPerDay,
        totalDays,
        totalEarned,
        category:    post.shiftType ?? "General",
      });
    }

    entries.sort((a, b) => b.startAt - a.startAt);

    const totalEarned = entries.reduce((s, e) => s + e.totalEarned, 0);
    const totalDays   = entries.reduce((s, e) => s + e.totalDays,   0);
    const totalShifts = entries.length;
    const avgPerShift = totalShifts > 0 ? Math.round(totalEarned / totalShifts) : 0;
    const avgPerDay   = totalDays   > 0 ? Math.round(totalEarned / totalDays)   : 0;

    /* By month */
    const monthMap = new Map<string, { earned: number; shifts: number }>();
    for (const e of entries) {
      const label = monthLabel(e.startAt);
      const existing = monthMap.get(label) ?? { earned: 0, shifts: 0 };
      monthMap.set(label, { earned: existing.earned + e.totalEarned, shifts: existing.shifts + 1 });
    }
    const byMonth = Array.from(monthMap.entries())
      .map(([label, v]) => ({ label, ...v }))
      .slice(0, 6);

    /* By company */
    const companyMap = new Map<string, { earned: number; shifts: number }>();
    for (const e of entries) {
      const existing = companyMap.get(e.companyName) ?? { earned: 0, shifts: 0 };
      companyMap.set(e.companyName, { earned: existing.earned + e.totalEarned, shifts: existing.shifts + 1 });
    }
    const byCompany = Array.from(companyMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 5);

    /* By week */
    const weekMap = new Map<string, { earned: number; shifts: number; ts: number }>();
    for (const e of entries) {
      const d = new Date(e.startAt);
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
      const label = monday.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const existing = weekMap.get(label) ?? { earned: 0, shifts: 0, ts: monday.getTime() };
      weekMap.set(label, { earned: existing.earned + e.totalEarned, shifts: existing.shifts + 1, ts: existing.ts });
    }
    const byWeek = Array.from(weekMap.entries())
      .map(([label, v]) => ({ label, earned: v.earned, shifts: v.shifts, ts: v.ts }))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8)
      .map(({ label, earned, shifts }) => ({ label, earned, shifts }));

    return { totalEarned, totalShifts, totalDays, avgPerShift, avgPerDay, byMonth, byWeek, byCompany, entries };
  },

  subscribe: shiftApplicationsStorage.subscribe,
};