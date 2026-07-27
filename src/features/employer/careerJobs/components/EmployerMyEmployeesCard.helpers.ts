import type { CSSProperties } from "react";
import { myStaffStorage, type StaffRecord } from "../../myStaff/storage/myStaff.storage";

export const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
export const INACTIVE_BADGE_BG = "rgba(15,23,42,0.055)";
export const INACTIVE_BADGE_TEXT = "rgba(15,23,42,0.58)";

export const CARD_STYLE: CSSProperties = {
  padding: 15,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(29,78,216,0.16)",
  background:
    "radial-gradient(circle at 92% 8%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.99))",
  boxShadow: "0 18px 38px rgba(15,23,42,0.07)",
  display: "grid",
  gap: 12,
};

let cached: StaffRecord[] = [];

export function getSnapshot(): StaffRecord[] {
  const fresh = myStaffStorage.getAll();

  if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
    cached = fresh;
  }

  return cached;
}

export function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function isActiveStaff(record: StaffRecord): boolean {
  return (
    record.status === "joining_pending" ||
    record.status === "active" ||
    record.status === "probation" ||
    record.status === "resignation_pending" ||
    record.status === "notice_period"
  );
}

export function getStatusLabel(status: StaffRecord["status"]): string {
  if (status === "joining_pending") return "Joining Pending";
  if (status === "probation") return "Probation";
  if (status === "resignation_pending") return "Resignation Pending";
  if (status === "notice_period") return "Notice Period";
  if (status === "exited") return "Exited";
  return "Currently Working";
}

export function getStatusStyle(status: StaffRecord["status"]): CSSProperties {
  if (status === "resignation_pending" || status === "notice_period") {
    return {
      color: "#b45309",
      background: "rgba(217,119,6,0.08)",
    };
  }

  if (status === "exited") {
    return {
      color: CAREER_MUTED,
      background: "rgba(15,23,42,0.055)",
    };
  }

  return {
    color: CAREER_BLUE_DEEP,
    background: "rgba(29,78,216,0.08)",
  };
}

export function needsAction(record: StaffRecord): boolean {
  return record.status === "joining_pending" || record.status === "resignation_pending";
}
