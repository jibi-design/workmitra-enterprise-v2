import type { CSSProperties } from "react";

export const CARD_STYLE: CSSProperties = {
  padding: 16,
  borderLeft: "5px solid var(--wm-er-accent-shift, #16a34a)",
};

export const REASON_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "9px 10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(22,163,74,0.07)",
  border: "1px solid rgba(22,163,74,0.14)",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

export const DOCUMENT_ACCESS_CARD_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "12px 12px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(217,119,6,0.28)",
  background: "linear-gradient(180deg, rgba(255,251,235,0.96), rgba(255,255,255,0.98))",
  boxShadow: "0 10px 22px rgba(217,119,6,0.08)",
};

export const DOCUMENT_ACCESS_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

export const DOCUMENT_ACCESS_BADGE_STYLE: CSSProperties = {
  padding: "4px 8px",
  borderRadius: "var(--wm-radius-pill)",
  background: "rgba(217,119,6,0.1)",
  border: "1px solid rgba(217,119,6,0.2)",
  color: "#92400e",
  fontSize: 9,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: 0.35,
  whiteSpace: "nowrap",
};

export const DOCUMENT_ACCESS_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-chip)",
  border: "none",
  background: "#d97706",
  color: "#fff",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 8px 16px rgba(217,119,6,0.18)",
};
