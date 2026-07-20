// App: Job Mitra / WorkMitra_Enterprise_v2
// File: acceptResignationStyles.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\acceptResignation\acceptResignationStyles.ts

export const OVERLAY: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

export const CARD: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

export const TITLE: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  color: "#16a34a",
  marginBottom: 4,
};

export const SUB: React.CSSProperties = {
  fontSize: 13,
  color: "var(--wm-er-muted)",
  marginBottom: 16,
};

export const BTN_ROW: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

export const CANCEL_BTN: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "1.5px solid rgba(0,0,0,0.12)",
  background: "transparent",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--wm-er-text)",
  cursor: "pointer",
};

export function nextBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: enabled ? "#16a34a" : "#e5e7eb",
    color: enabled ? "#fff" : "#9ca3af",
    fontWeight: 600,
    fontSize: 13,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}
