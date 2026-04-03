// src/features/employer/company/helpers/settingsStyles.ts
// All inline style constants for Employer Settings.
// Session 7: borders updated to 1.5px #d1d5db, Coming Soon pill, logo dashed border.
// Fix: disabled inputs now retain dark readable text (#1e293b).

import type { CSSProperties } from "react";

export const sectionHeadStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
};

export const sectionIconStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--wm-er-divider)",
  background: "rgba(255, 255, 255, 0.85)",
  color: "var(--wm-er-muted)",
  flexShrink: 0,
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  lineHeight: 1.2,
};

export const fieldGroupStyle: CSSProperties = {
  marginBottom: 14,
};

export const fieldLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-muted)",
  marginBottom: 5,
};

export const fieldInputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: "var(--wm-radius-10)",
  border: "1.5px solid #d1d5db",
  background: "var(--wm-er-card)",
  padding: "0 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

export const fieldInputDisabledStyle: CSSProperties = {
  ...fieldInputStyle,
  background: "var(--wm-er-bg)",
  color: "#1e293b",
  cursor: "not-allowed",
};

export const fieldSelectStyle: CSSProperties = {
  ...fieldInputStyle,
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

export const fieldSelectDisabledStyle: CSSProperties = {
  ...fieldSelectStyle,
  background: "var(--wm-er-bg)",
  color: "#1e293b",
  cursor: "not-allowed",
};

export const fieldTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 80,
  borderRadius: "var(--wm-radius-10)",
  border: "1.5px solid #d1d5db",
  background: "var(--wm-er-card)",
  padding: "10px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s ease",
};

export const fieldTextareaDisabledStyle: CSSProperties = {
  ...fieldTextareaStyle,
  background: "var(--wm-er-bg)",
  color: "#1e293b",
  resize: "none",
};

export const fieldRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

export const comingSoonBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 800,
  background: "rgba(100, 116, 139, 0.08)",
  color: "#64748b",
};

export const toggleTrackStyle = (enabled: boolean): CSSProperties => ({
  width: 44,
  height: 24,
  borderRadius: 999,
  border: "1px solid var(--wm-er-border)",
  background: enabled ? "var(--wm-success)" : "var(--wm-er-bg)",
  position: "relative",
  cursor: "pointer",
  transition: "background 0.2s ease",
  flexShrink: 0,
});

export const toggleThumbStyle = (enabled: boolean): CSSProperties => ({
  width: 18,
  height: 18,
  borderRadius: 999,
  background: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
  position: "absolute",
  top: 2,
  left: enabled ? 22 : 3,
  transition: "left 0.2s ease",
});

export const dangerBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 40,
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid rgba(220, 38, 38, 0.22)",
  background: "rgba(220, 38, 38, 0.06)",
  padding: "0 16px",
  fontWeight: 800,
  fontSize: 13,
  color: "var(--wm-error)",
  cursor: "pointer",
  transition: "background 0.15s ease",
};

export const logoPlaceholderStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 12,
  border: "2px dashed #d1d5db",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--wm-er-bg)",
  flexShrink: 0,
};