// src/shared/utils/jobAlertStorage.ts
//
// Job Alert storage — save, delete, list, match check.
// Runs on app open: scan new posts since lastCheckedAt → generate notifications.

import type {
  JobAlert,
  ShiftAlertCriteria,
  CareerAlertCriteria,
  AlertDomain,
} from "./jobAlertTypes";
import { MAX_ALERTS, ALERT_STORAGE_KEY } from "./jobAlertTypes";

/* ------------------------------------------------ */
/* ID helper                                        */
/* ------------------------------------------------ */
function newId(): string {
  return `ja_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ------------------------------------------------ */
/* Read / Write                                     */
/* ------------------------------------------------ */
function readAlerts(): JobAlert[] {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is JobAlert => typeof x === "object" && x !== null && typeof (x as Record<string, unknown>)["id"] === "string",
    );
  } catch { return []; }
}

function writeAlerts(list: JobAlert[]): void {
  try { localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(list)); } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Build label from criteria                        */
/* ------------------------------------------------ */
function buildLabel(domain: AlertDomain, criteria: ShiftAlertCriteria | CareerAlertCriteria): string {
  const parts: string[] = [domain === "shift" ? "Shift" : "Career"];
  if (criteria.query) parts.push(`"${criteria.query}"`);
  if ("category" in criteria && criteria.category && criteria.category !== "any") parts.push(criteria.category);
  if ("jobType" in criteria && criteria.jobType && criteria.jobType !== "any") parts.push(criteria.jobType);
  if ("workMode" in criteria && criteria.workMode && criteria.workMode !== "any") parts.push(criteria.workMode);
  if ("department" in criteria && criteria.department && criteria.department !== "any") parts.push(criteria.department);
  if (criteria.experience && criteria.experience !== "any") parts.push(criteria.experience);
  if ("minPay" in criteria && criteria.minPay && criteria.minPay > 0) parts.push(`${criteria.minPay}+/day`);
  return parts.join(" · ");
}

/* ------------------------------------------------ */
/* Post type (generic for matching)                 */
/* ------------------------------------------------ */
type MatchablePost = Record<string, unknown>;

function str(r: MatchablePost, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v.toLowerCase() : "";
}

function numVal(r: MatchablePost, k: string): number {
  const v = r[k];
  return typeof v === "number" ? v : 0;
}

/* ------------------------------------------------ */
/* Match logic                                      */
/* ------------------------------------------------ */
function matchesShift(post: MatchablePost, c: ShiftAlertCriteria): boolean {
  if (c.query) {
    const q = c.query.toLowerCase();
    const text = `${str(post, "jobName")} ${str(post, "companyName")} ${str(post, "locationName")} ${str(post, "category")}`;
    if (!text.includes(q)) return false;
  }
  if (c.category && c.category !== "any" && str(post, "category") !== c.category.toLowerCase()) return false;
  if (c.experience && c.experience !== "any" && str(post, "experience") !== c.experience) return false;
  if (c.minPay && c.minPay > 0 && numVal(post, "payPerDay") < c.minPay) return false;
  return true;
}

function matchesCareer(post: MatchablePost, c: CareerAlertCriteria): boolean {
  if (c.query) {
    const q = c.query.toLowerCase();
    const text = `${str(post, "jobTitle")} ${str(post, "companyName")} ${str(post, "location")} ${str(post, "department")}`;
    if (!text.includes(q)) return false;
  }
  if (c.jobType && c.jobType !== "any" && str(post, "jobType") !== c.jobType) return false;
  if (c.workMode && c.workMode !== "any" && str(post, "workMode") !== c.workMode) return false;
  if (c.department && c.department !== "any" && str(post, "department").toLowerCase() !== c.department.toLowerCase()) return false;
  return true;
}

/* ------------------------------------------------ */
/* Read posts from storage                          */
/* ------------------------------------------------ */
const SHIFT_POSTS_KEY = "wm_employee_shift_posts_demo_v1";
const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";

function getPostsSince(key: string, since: number): MatchablePost[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is MatchablePost => {
      if (typeof x !== "object" || x === null) return false;
      const r = x as MatchablePost;
      const created = typeof r["createdAt"] === "number" ? r["createdAt"] : 0;
      return created > since;
    });
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Notification push                                */
/* ------------------------------------------------ */
const EE_NOTIF_KEY = "wm_employee_notifications_v1";

function pushNotification(title: string, message: string, route: string): void {
  try {
    const raw = localStorage.getItem(EE_NOTIF_KEY);
    const list: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      title,
      message,
      route,
      read: false,
      createdAt: Date.now(),
      domain: "shift",
    });
    localStorage.setItem(EE_NOTIF_KEY, JSON.stringify(list.slice(0, 100)));
  } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const jobAlertStorage = {
  getAll(): JobAlert[] {
    return readAlerts();
  },

  save(domain: AlertDomain, criteria: ShiftAlertCriteria | CareerAlertCriteria): { success: boolean; reason?: string } {
    const list = readAlerts();
    if (list.length >= MAX_ALERTS) {
      return { success: false, reason: `Maximum ${MAX_ALERTS} alerts allowed. Delete an existing alert first.` };
    }

    const alert: JobAlert = {
      id: newId(),
      domain,
      label: buildLabel(domain, criteria),
      createdAt: Date.now(),
      lastCheckedAt: Date.now(),
      criteria,
    };

    writeAlerts([alert, ...list]);
    return { success: true };
  },

  delete(alertId: string): void {
    writeAlerts(readAlerts().filter((a) => a.id !== alertId));
  },

  /** Run on app open — scan new posts, generate notifications, update lastCheckedAt */
  checkAlerts(): number {
    const alerts = readAlerts();
    if (alerts.length === 0) return 0;

    let totalMatches = 0;

    for (const alert of alerts) {
      const since = alert.lastCheckedAt;
      const criteria = alert.criteria;

      let matches: MatchablePost[] = [];

      if (criteria.domain === "shift") {
        const posts = getPostsSince(SHIFT_POSTS_KEY, since);
        matches = posts.filter((p) => matchesShift(p, criteria));
      } else {
        const posts = getPostsSince(CAREER_POSTS_KEY, since);
        matches = posts.filter((p) => matchesCareer(p, criteria));
      }

      if (matches.length > 0) {
        const label = alert.label;
        pushNotification(
          `${matches.length} new ${matches.length === 1 ? "job" : "jobs"} match your alert`,
          `Alert: ${label}`,
          criteria.domain === "shift" ? "/employee/shift/search" : "/employee/career/search",
        );
        totalMatches += matches.length;
      }

      alert.lastCheckedAt = Date.now();
    }

    writeAlerts(alerts);
    return totalMatches;
  },
} as const;