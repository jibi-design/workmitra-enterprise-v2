import type { CSSProperties } from "react";
import type { WorkDayStatus } from "../helpers/workDiary.types";
import { workDiaryStorage } from "../storage/workDiary.storage";

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-emp-text, var(--wm-er-text))",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-emp-muted, var(--wm-er-muted))",
  display: "block",
  marginBottom: 3,
};

export function getInitialEntry(employmentId: string, dateKey: string) {
  const entry = workDiaryStorage.getDayEntry(employmentId, dateKey);
  return {
    status: entry?.status ?? ("worked" as WorkDayStatus),
    punchIn: entry?.punchInTime ?? "",
    punchOut: entry?.punchOutTime ?? "",
    location: entry?.location ?? "",
    notes: entry?.notes ?? "",
  };
}
