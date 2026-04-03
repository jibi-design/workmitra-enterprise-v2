// src/features/employer/helpers/ratingNudgeNotificationService.ts
//
// Rating Nudge — Auto notification system.
// Checks for unrated completed shifts/groups and pushes reminder
// notifications at 24hr and 72hr intervals.
// Call checkAndSendRatingReminders() on employer app load or page visit.

import { getShiftUnratedWorkspaceIds, getWorkforceUnratedGroupIds } from "./ratingNudgeHelpers";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Constants                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

const NUDGE_LOG_KEY = "wm_rating_nudge_log_v1";
const EMPLOYER_NOTIFICATIONS_KEY = "wm_employer_notifications_v1";
const EMPLOYER_NOTIFICATIONS_CHANGED = "wm:employer-notifications-changed";

const HOURS_24 = 24 * 60 * 60 * 1000;
const HOURS_72 = 72 * 60 * 60 * 1000;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type NudgeEntry = {
  targetId: string;
  domain: "shift" | "workforce";
  firstSentAt: number;
  secondSentAt: number | null;
};

type NudgeLog = NudgeEntry[];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Storage helpers                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

function readNudgeLog(): NudgeLog {
  try {
    const raw = localStorage.getItem(NUDGE_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as NudgeLog) : [];
  } catch {
    return [];
  }
}

function writeNudgeLog(log: NudgeLog): void {
  try {
    localStorage.setItem(NUDGE_LOG_KEY, JSON.stringify(log));
  } catch {
    // demo-safe ignore
  }
}

function uid(): string {
  return `en_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function pushEmployerNotification(
  domain: "shift" | "workforce",
  title: string,
  body: string,
): void {
  try {
    const raw = localStorage.getItem(EMPLOYER_NOTIFICATIONS_KEY);
    const existing: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : [];

    const note = {
      id: uid(),
      domain,
      title,
      body,
      createdAt: Date.now(),
      isRead: false,
    };

    const next = [note, ...existing].slice(0, 150);
    localStorage.setItem(EMPLOYER_NOTIFICATIONS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EMPLOYER_NOTIFICATIONS_CHANGED));
  } catch {
    // demo-safe ignore
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Completion time helpers                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

function safeParseArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getShiftCompletedAt(workspaceId: string): number | null {
  const workspaces = safeParseArray("wm_employee_shift_workspaces_v1");
  for (const ws of workspaces) {
    if (!isRec(ws)) continue;
    if (ws["id"] !== workspaceId) continue;
    if (ws["status"] !== "completed") return null;
    const at = ws["lastActivityAt"];
    return typeof at === "number" ? at : null;
  }
  return null;
}

function getGroupCompletedAt(groupId: string): number | null {
  const groups = safeParseArray("wm_workforce_groups_v1");
  for (const g of groups) {
    if (!isRec(g)) continue;
    if (g["id"] !== groupId) continue;
    if (g["status"] !== "completed") return null;
    const at = g["completedAt"];
    return typeof at === "number" ? at : null;
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main checker — call on employer app load                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

export function checkAndSendRatingReminders(): void {
  const now = Date.now();
  const log = readNudgeLog();
  let changed = false;

  // ── Shift workspaces ──
  const shiftUnrated = getShiftUnratedWorkspaceIds();

  for (const wsId of shiftUnrated) {
    const completedAt = getShiftCompletedAt(wsId);
    if (!completedAt) continue;

    const elapsed = now - completedAt;
    const existing = log.find((e) => e.targetId === wsId && e.domain === "shift");

    if (!existing && elapsed >= HOURS_24) {
      pushEmployerNotification(
        "shift",
        "Rate your worker",
        "A completed shift has an unrated worker. Your rating helps them get better opportunities.",
      );
      log.push({ targetId: wsId, domain: "shift", firstSentAt: now, secondSentAt: null });
      changed = true;
    } else if (existing && existing.secondSentAt === null && elapsed >= HOURS_72) {
      pushEmployerNotification(
        "shift",
        "Reminder: Rate your worker",
        "You still have an unrated worker from a completed shift. It only takes a moment.",
      );
      existing.secondSentAt = now;
      changed = true;
    }
  }

  // ── Workforce groups ──
  const wfUnrated = getWorkforceUnratedGroupIds();

  for (const gId of wfUnrated) {
    const completedAt = getGroupCompletedAt(gId);
    if (!completedAt) continue;

    const elapsed = now - completedAt;
    const existing = log.find((e) => e.targetId === gId && e.domain === "workforce");

    if (!existing && elapsed >= HOURS_24) {
      pushEmployerNotification(
        "workforce",
        "Rate your team",
        "A completed group has unrated members. Your rating helps workers build their reputation.",
      );
      log.push({ targetId: gId, domain: "workforce", firstSentAt: now, secondSentAt: null });
      changed = true;
    } else if (existing && existing.secondSentAt === null && elapsed >= HOURS_72) {
      pushEmployerNotification(
        "workforce",
        "Reminder: Rate your team",
        "You still have unrated team members from a completed group. It only takes a moment.",
      );
      existing.secondSentAt = now;
      changed = true;
    }
  }

  if (changed) {
    writeNudgeLog(log);
  }
}