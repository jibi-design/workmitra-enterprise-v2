// src/features/employer/shiftJobs/types/shiftWorkspaceTypes.ts
//
// Types and pure display helpers for EmployerShiftWorkspacePage.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ShiftWorkspaceCategory = "construction" | "kitchen" | "office" | "delivery" | "other";
export type ShiftWorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type ShiftWorkspaceUpdate = {
  id: string;
  createdAt: number;
  kind: "system" | "broadcast" | "direct";
  title: string;
  body?: string;
};

export type ShiftWorkspace = {
  id: string;
  postId: string;
  companyName: string;
  jobName: string;
  category: ShiftWorkspaceCategory;
  locationName: string;
  startAt: number;
  endAt: number;
  status: ShiftWorkspaceStatus;
  lastActivityAt: number;
  unreadCount: number;
  updates: ShiftWorkspaceUpdate[];
  exitedAt?: number;
  exitReason?: "emergency" | "sick" | "travel" | "other";
  exitNote?: string;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
};

/* ------------------------------------------------ */
/* Display helpers                                  */
/* ------------------------------------------------ */
export function statusLabel(s: ShiftWorkspaceStatus): string {
  if (s === "active") return "ACTIVE";
  if (s === "upcoming") return "UPCOMING";
  if (s === "completed") return "COMPLETED";
  if (s === "replaced") return "REPLACED";
  return "LEFT";
}

export function isReadOnlyStatus(s: ShiftWorkspaceStatus): boolean {
  return s === "left" || s === "replaced" || s === "completed";
}

export function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const sameDay = s.toDateString() === e.toDateString();
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameDay ? sTxt : `${sTxt} - ${eTxt}`;
  } catch { return "Date"; }
}

export function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

export function updateKindLabel(kind: ShiftWorkspaceUpdate["kind"]): string {
  if (kind === "broadcast") return "ANNOUNCEMENT";
  if (kind === "direct") return "DIRECT";
  return "SYSTEM";
}

export function updateKindPillClass(kind: ShiftWorkspaceUpdate["kind"]): string {
  if (kind === "broadcast" || kind === "system") return "wm-pillNeutral";
  return "wm-pillDanger";
}

export function detectSenderTag(u: ShiftWorkspaceUpdate): { text: string; className: string } | null {
  const t = (u.title ?? "").toLowerCase();
  const b = (u.body ?? "").toLowerCase();
  if (u.kind === "direct" && (t.includes("reply (employee)") || b.includes("reply (employee)"))) {
    return { text: "FROM WORKER", className: "wm-pillDanger" };
  }
  if (u.kind === "direct" && (t.includes("reply (employer)") || b.includes("reply (employer)"))) {
    return { text: "FROM EMPLOYER", className: "wm-pillNeutral" };
  }
  if (u.kind === "broadcast") return { text: "EMPLOYER", className: "wm-pillNeutral" };
  if (u.kind === "system") return { text: "SYSTEM", className: "wm-pillNeutral" };
  if (u.kind === "direct") return { text: "DIRECT", className: "wm-pillDanger" };
  return null;
}

export function updateRowStyle(u: ShiftWorkspaceUpdate): { border: string; bg: string } {
  if (u.kind === "direct") return { border: "1px solid rgba(255,60,90,0.35)", bg: "rgba(255,60,90,0.08)" };
  return { border: "1px solid var(--wm-er-divider)", bg: "rgba(255,255,255,0.02)" };
}

export function clampText(raw: string, max: number): string {
  const t = raw.trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) : t;
}

export function wsId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}