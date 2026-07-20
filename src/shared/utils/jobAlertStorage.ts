// App name: Job Mitra
// File name: jobAlertStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\utils\jobAlertStorage.ts

// Job Alert storage — save, delete, list, match check.
// Runs on app open: scan new posts since lastCheckedAt → generate notifications.

import type {
  JobAlert,
  ShiftAlertCriteria,
  CareerAlertCriteria,
  AlertDomain,
} from "./jobAlertTypes";
import { MAX_ALERTS, ALERT_STORAGE_KEY } from "./jobAlertTypes";
import {
  cleanNotificationRoute,
  cleanNotificationText,
  DEFAULT_NOTIFICATION_MAX_ITEMS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  hasRecentNotificationDuplicate,
  normalizeAnyDomainNotificationInput,
  parseNotificationJson,
  uniqueLatestNotifications,
  type NotificationLike,
} from "../notifications/guards";

const MAX_ALERT_QUERY_LENGTH = 80;
const MAX_ALERT_TEXT_LENGTH = 80;
const MAX_MIN_PAY = 999_999_999;

const SHIFT_POSTS_KEY = "wm_employer_shift_posts_v1";
const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";

const EE_NOTIF_KEY = "wm_employee_notifications_v1";
const EE_NOTIF_EVENT = "wm:employee-notifications-changed";

type Rec = Record<string, unknown>;

function newId(): string {
  return `ja_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function newNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v.toLowerCase() : "";
}

function stringValue(value: unknown, maxLength = MAX_ALERT_TEXT_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;

  const clean = value.trim().replace(/\s+/g, " ").slice(0, maxLength);

  return clean || undefined;
}

function numVal(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function getSafeTimestamp(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // demo-safe
  }
}

function normalizeShiftCriteria(criteria: ShiftAlertCriteria): ShiftAlertCriteria | null {
  const normalized: ShiftAlertCriteria = {
    domain: "shift",
  };

  const query = stringValue(criteria.query, MAX_ALERT_QUERY_LENGTH);
  const category = stringValue(criteria.category);
  const experience = stringValue(criteria.experience);
  const minPay =
    typeof criteria.minPay === "number" && Number.isFinite(criteria.minPay)
      ? Math.min(Math.max(0, Math.floor(criteria.minPay)), MAX_MIN_PAY)
      : undefined;

  if (query) normalized.query = query;
  if (category && category !== "any") normalized.category = category;
  if (experience && experience !== "any") normalized.experience = experience;
  if (minPay && minPay > 0) normalized.minPay = minPay;

  return normalized.query || normalized.category || normalized.experience || normalized.minPay
    ? normalized
    : null;
}

function normalizeCareerCriteria(criteria: CareerAlertCriteria): CareerAlertCriteria | null {
  const normalized: CareerAlertCriteria = {
    domain: "career",
  };

  const query = stringValue(criteria.query, MAX_ALERT_QUERY_LENGTH);
  const jobType = stringValue(criteria.jobType);
  const workMode = stringValue(criteria.workMode);
  const experience = stringValue(criteria.experience);
  const department = stringValue(criteria.department);

  if (query) normalized.query = query;
  if (jobType && jobType !== "any") normalized.jobType = jobType;
  if (workMode && workMode !== "any") normalized.workMode = workMode;
  if (experience && experience !== "any") normalized.experience = experience;
  if (department && department !== "any") normalized.department = department;

  return normalized.query ||
    normalized.jobType ||
    normalized.workMode ||
    normalized.experience ||
    normalized.department
    ? normalized
    : null;
}

function normalizeCriteria(
  domain: AlertDomain,
  criteria: ShiftAlertCriteria | CareerAlertCriteria,
): ShiftAlertCriteria | CareerAlertCriteria | null {
  if (domain === "shift") return normalizeShiftCriteria(criteria as ShiftAlertCriteria);

  return normalizeCareerCriteria(criteria as CareerAlertCriteria);
}

function criteriaKey(criteria: ShiftAlertCriteria | CareerAlertCriteria): string {
  return JSON.stringify(criteria);
}

function buildLabel(
  domain: AlertDomain,
  criteria: ShiftAlertCriteria | CareerAlertCriteria,
): string {
  const parts: string[] = [domain === "shift" ? "Shift" : "Career"];

  if (criteria.query) parts.push(`"${criteria.query}"`);
  if ("category" in criteria && criteria.category && criteria.category !== "any")
    parts.push(criteria.category);
  if ("jobType" in criteria && criteria.jobType && criteria.jobType !== "any")
    parts.push(criteria.jobType);
  if ("workMode" in criteria && criteria.workMode && criteria.workMode !== "any")
    parts.push(criteria.workMode);
  if ("department" in criteria && criteria.department && criteria.department !== "any")
    parts.push(criteria.department);
  if (criteria.experience && criteria.experience !== "any") parts.push(criteria.experience);
  if ("minPay" in criteria && criteria.minPay && criteria.minPay > 0)
    parts.push(`${criteria.minPay}+/day`);

  return parts.join(" · ");
}

function parseAlert(value: unknown): JobAlert | null {
  if (!isRec(value)) return null;

  const domain = value.domain === "shift" || value.domain === "career" ? value.domain : null;
  if (!domain || !isRec(value.criteria)) return null;

  const criteria = normalizeCriteria(
    domain,
    value.criteria as ShiftAlertCriteria | CareerAlertCriteria,
  );
  if (!criteria) return null;

  const now = Date.now();
  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : newId();

  return {
    id,
    domain,
    label:
      typeof value.label === "string" && value.label.trim()
        ? value.label.trim()
        : buildLabel(domain, criteria),
    createdAt: getSafeTimestamp(value.createdAt, now),
    lastCheckedAt: getSafeTimestamp(value.lastCheckedAt, now),
    criteria,
  };
}

function readAlerts(): JobAlert[] {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const byKey = new Map<string, JobAlert>();

    for (const item of parsed) {
      const alert = parseAlert(item);
      if (!alert) continue;

      const key = `${alert.domain}:${criteriaKey(alert.criteria)}`;
      const existing = byKey.get(key);

      if (!existing || alert.createdAt > existing.createdAt) {
        byKey.set(key, alert);
      }
    }

    return Array.from(byKey.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_ALERTS);
  } catch {
    return [];
  }
}

function writeAlerts(list: JobAlert[]): void {
  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ALERTS)));
  } catch {
    // demo-safe
  }
}

type MatchablePost = Record<string, unknown>;

function matchesShift(post: MatchablePost, criteria: ShiftAlertCriteria): boolean {
  if (criteria.query) {
    const query = criteria.query.toLowerCase();
    const text = `${str(post, "jobName")} ${str(post, "companyName")} ${str(post, "locationName")} ${str(post, "category")}`;
    if (!text.includes(query)) return false;
  }

  if (
    criteria.category &&
    criteria.category !== "any" &&
    str(post, "category") !== criteria.category.toLowerCase()
  )
    return false;
  if (
    criteria.experience &&
    criteria.experience !== "any" &&
    str(post, "experience") !== criteria.experience.toLowerCase()
  )
    return false;
  if (criteria.minPay && criteria.minPay > 0 && numVal(post, "payPerDay") < criteria.minPay)
    return false;

  return true;
}

function careerExperienceMatches(post: MatchablePost, experience: string): boolean {
  const min = numVal(post, "experienceMin");
  const max = numVal(post, "experienceMax");

  if (experience === "0-1") return min <= 1 && max >= 0;
  if (experience === "1-3") return min <= 3 && max >= 1;
  if (experience === "3-7") return min <= 7 && max >= 3;
  if (experience === "7+") return max >= 7;

  return true;
}

function matchesCareer(post: MatchablePost, criteria: CareerAlertCriteria): boolean {
  const status = str(post, "status");
  const closingDate = numVal(post, "closingDate");

  if (status && status !== "active") return false;
  if (closingDate > 0 && closingDate <= Date.now()) return false;

  if (criteria.query) {
    const query = criteria.query.toLowerCase();
    const text = `${str(post, "jobTitle")} ${str(post, "companyName")} ${str(post, "location")} ${str(post, "department")}`;
    if (!text.includes(query)) return false;
  }

  if (
    criteria.jobType &&
    criteria.jobType !== "any" &&
    str(post, "jobType") !== criteria.jobType.toLowerCase()
  )
    return false;
  if (
    criteria.workMode &&
    criteria.workMode !== "any" &&
    str(post, "workMode") !== criteria.workMode.toLowerCase()
  )
    return false;
  if (
    criteria.department &&
    criteria.department !== "any" &&
    str(post, "department") !== criteria.department.toLowerCase()
  )
    return false;
  if (
    criteria.experience &&
    criteria.experience !== "any" &&
    !careerExperienceMatches(post, criteria.experience)
  )
    return false;

  return true;
}

function getPostsSince(key: string, since: number): MatchablePost[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];

    return arr.filter((x): x is MatchablePost => {
      if (!isRec(x)) return false;

      const created =
        typeof x.createdAt === "number" && Number.isFinite(x.createdAt) ? x.createdAt : 0;
      return created > since;
    });
  } catch {
    return [];
  }
}

function readExistingEmployeeNotifications(): NotificationLike[] {
  try {
    return parseNotificationJson(localStorage.getItem(EE_NOTIF_KEY))
      .map((item) => normalizeAnyDomainNotificationInput(item))
      .filter((item): item is NotificationLike => item !== null);
  } catch {
    return [];
  }
}

function pushNotification(title: string, body: string, route: string, domain: AlertDomain): void {
  const cleanTitle = cleanNotificationText(title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  const cleanBody = cleanNotificationText(body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body);
  const safeRoute = cleanNotificationRoute(route);

  if (!cleanTitle || !cleanBody || !safeRoute) return;

  try {
    const existing = readExistingEmployeeNotifications();

    const item: NotificationLike = {
      id: newNotificationId(),
      domain,
      title: cleanTitle,
      body: cleanBody,
      route: safeRoute,
      isRead: false,
      createdAt: Date.now(),
    };

    if (hasRecentNotificationDuplicate(existing, item)) return;

    localStorage.setItem(
      EE_NOTIF_KEY,
      JSON.stringify(
        uniqueLatestNotifications([item, ...existing], DEFAULT_NOTIFICATION_MAX_ITEMS),
      ),
    );
    safeDispatch(EE_NOTIF_EVENT);
  } catch {
    // demo-safe
  }
}

export const jobAlertStorage = {
  getAll(): JobAlert[] {
    return readAlerts();
  },

  save(
    domain: AlertDomain,
    criteria: ShiftAlertCriteria | CareerAlertCriteria,
  ): { success: boolean; reason?: string } {
    const normalizedCriteria = normalizeCriteria(domain, criteria);

    if (!normalizedCriteria) {
      return {
        success: false,
        reason: "Choose at least one search term or filter before saving this alert.",
      };
    }

    const list = readAlerts();
    const duplicateKey = `${domain}:${criteriaKey(normalizedCriteria)}`;
    const duplicate = list.some(
      (alert) => `${alert.domain}:${criteriaKey(alert.criteria)}` === duplicateKey,
    );

    if (duplicate) {
      return { success: false, reason: "This search alert is already saved." };
    }

    if (list.length >= MAX_ALERTS) {
      return {
        success: false,
        reason: `Maximum ${MAX_ALERTS} alerts allowed. Delete an existing alert first.`,
      };
    }

    const now = Date.now();

    const alert: JobAlert = {
      id: newId(),
      domain,
      label: buildLabel(domain, normalizedCriteria),
      createdAt: now,
      lastCheckedAt: now,
      criteria: normalizedCriteria,
    };

    writeAlerts([alert, ...list]);
    return { success: true };
  },

  delete(alertId: string): void {
    const cleanId = alertId.trim();
    if (!cleanId) return;

    writeAlerts(readAlerts().filter((alert) => alert.id !== cleanId));
  },

  checkAlerts(): number {
    const alerts = readAlerts();
    if (alerts.length === 0) return 0;

    let totalMatches = 0;
    const now = Date.now();

    for (const alert of alerts) {
      const since = alert.lastCheckedAt;
      const criteria = alert.criteria;
      let matches: MatchablePost[] = [];

      if (criteria.domain === "shift") {
        const posts = getPostsSince(SHIFT_POSTS_KEY, since);
        matches = posts.filter((post) => matchesShift(post, criteria));
      } else {
        const posts = getPostsSince(CAREER_POSTS_KEY, since);
        matches = posts.filter((post) => matchesCareer(post, criteria));
      }

      if (matches.length > 0) {
        pushNotification(
          `${matches.length} new ${matches.length === 1 ? "job" : "jobs"} match your alert`,
          `Alert: ${alert.label}`,
          criteria.domain === "shift" ? "/employee/shift/search" : "/employee/career/search",
          criteria.domain,
        );

        totalMatches += matches.length;
      }

      alert.lastCheckedAt = now;
    }

    writeAlerts(alerts);
    return totalMatches;
  },
} as const;
