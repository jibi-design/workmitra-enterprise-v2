import type { CSSProperties } from "react";

export const CAREER_BLUE = "#2563eb";

export const ICON_WRAP: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "var(--wm-radius-chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,0.1)",
  color: CAREER_BLUE,
  flexShrink: 0,
};

export const SUMMARY_CARD: CSSProperties = {
  marginTop: "var(--wm-stack-gap)",
  background: "linear-gradient(180deg, rgba(239,246,255,0.78), rgba(255,255,255,0.98))",
  border: "1px solid rgba(37,99,235,0.18)",
  borderRadius: "var(--wm-radius-chip)",
  padding: 14,
};

export const DETAIL_GRID: CSSProperties = {
  marginTop: "var(--wm-space-12)",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

export const DETAIL_BOX: CSSProperties = {
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "#fff",
  padding: "10px 12px",
};

export const DETAIL_LABEL: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.45,
};

export const DETAIL_VALUE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  lineHeight: 1.35,
};

export const WARNING_BOX: CSSProperties = {
  marginTop: "var(--wm-space-14)",
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(217,119,6,0.07)",
  border: "1px solid rgba(217,119,6,0.2)",
};

export const DUPLICATE_BOX: CSSProperties = {
  marginTop: "var(--wm-space-14)",
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(220,38,38,0.06)",
  border: "1px solid rgba(220,38,38,0.22)",
};

export const BTN_ROW: CSSProperties = {
  marginTop: "var(--wm-space-18, 18px)",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-10)",
};

export function cap(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}
