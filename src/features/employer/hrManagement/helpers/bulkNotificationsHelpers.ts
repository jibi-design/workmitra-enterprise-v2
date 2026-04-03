// src/features/employer/hrManagement/helpers/bulkNotificationsHelpers.ts

import type { CSSProperties } from "react";
import type { NoticeTarget } from "../types/companyNotice.types";

/* ------------------------------------------------ */
/* Extended Target type                             */
/* ------------------------------------------------ */
export type ExtendedTarget = NoticeTarget | "specific";

/* ------------------------------------------------ */
/* Target options                                   */
/* ------------------------------------------------ */
export const TARGET_OPTIONS: { value: ExtendedTarget; label: string; description: string }[] = [
  { value: "all", label: "All Employees", description: "Send to everyone in your company" },
  { value: "department", label: "By Department", description: "Send to a specific department only" },
  { value: "location", label: "By Location / Site", description: "Send to a specific location only" },
  { value: "specific", label: "Specific Employees", description: "Pick individual employees to send to" },
];

/* ------------------------------------------------ */
/* Shared styles                                    */
/* ------------------------------------------------ */
export const NOTIF_INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box" as const,
};

export const NOTIF_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};