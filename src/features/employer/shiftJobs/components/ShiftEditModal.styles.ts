import type { CSSProperties } from "react";

export const OVERLAY_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

export const PANEL_STYLE: CSSProperties = {
  background: "var(--wm-er-card, #fff)",
  borderRadius: "var(--wm-radius-chip)",
  width: "100%",
  maxWidth: 420,
  maxHeight: "92vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

export const HEADER_STYLE: CSSProperties = {
  padding: "16px 18px 12px",
  borderBottom: "1px solid var(--wm-er-border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const WARNING_BANNER_STYLE: CSSProperties = {
  margin: "12px 18px 0",
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10)",
  background: "rgba(217,119,6,0.07)",
  border: "1px solid rgba(217,119,6,0.2)",
  fontSize: 12,
  color: "#92400e",
  fontWeight: 600,
  lineHeight: 1.5,
};

export const FORM_BODY_STYLE: CSSProperties = {
  padding: "14px 18px",
  display: "grid",
  gap: 12,
};

export const FOOTER_STYLE: CSSProperties = {
  padding: "12px 18px 16px",
  borderTop: "1px solid var(--wm-er-border)",
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
};

export const PAY_PREVIEW_STYLE: CSSProperties = {
  marginTop: 6,
  padding: "9px 12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(22,163,74,0.06)",
  border: "1px solid rgba(22,163,74,0.16)",
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

export const CLOSE_BUTTON_STYLE: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--wm-er-muted)",
  fontSize: 18,
  padding: 4,
};

export const DATE_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

export const TEXTAREA_STYLE: CSSProperties = {
  height: 80,
  paddingTop: 10,
  fontFamily: "inherit",
};
