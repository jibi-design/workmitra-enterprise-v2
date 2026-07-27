import type {
  AlertDomain,
  CareerAlertCriteria,
  JobAlert,
  ShiftAlertCriteria,
} from "./jobAlertTypes";
import { ALERT_STORAGE_KEY, MAX_ALERTS } from "./jobAlertTypes";

const MAX_ALERT_QUERY_LENGTH = 80;
const MAX_ALERT_TEXT_LENGTH = 80;
const MAX_MIN_PAY = 999_999_999;

type Rec = Record<string, unknown>;

export function newId(): string {
  return `ja_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function newNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

export function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v.toLowerCase() : "";
}

export function stringValue(value: unknown, maxLength = MAX_ALERT_TEXT_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;

  const clean = value.trim().replace(/\s+/g, " ").slice(0, maxLength);

  return clean || undefined;
}

export function numVal(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function getSafeTimestamp(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function safeDispatch(eventName: string): void {
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

export function normalizeCriteria(
  domain: AlertDomain,
  criteria: ShiftAlertCriteria | CareerAlertCriteria,
): ShiftAlertCriteria | CareerAlertCriteria | null {
  if (domain === "shift") return normalizeShiftCriteria(criteria as ShiftAlertCriteria);

  return normalizeCareerCriteria(criteria as CareerAlertCriteria);
}

export function criteriaKey(criteria: ShiftAlertCriteria | CareerAlertCriteria): string {
  return JSON.stringify(criteria);
}

export function buildLabel(
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

export function readAlerts(): JobAlert[] {
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

export function writeAlerts(list: JobAlert[]): void {
  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ALERTS)));
  } catch {
    // demo-safe
  }
}
