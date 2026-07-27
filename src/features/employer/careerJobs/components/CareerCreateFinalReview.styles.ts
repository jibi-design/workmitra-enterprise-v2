import type { CSSProperties } from "react";

export const CARD_STYLE: CSSProperties = {
  marginTop: 16,
  padding: 20,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

export const SUMMARY_BOX_STYLE: CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: "var(--wm-radius-employee-card)",
  background: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
};

export const PILL_STYLE: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "var(--wm-radius-button)",
  background: "rgba(248, 250, 252, 0.8)",
  border: "1px solid rgba(0,0,0,0.05)",
};

export const MODAL_OVERLAY_STYLE: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.35)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

export const MODAL_STYLE: CSSProperties = {
  width: "90%",
  maxWidth: 440,
  padding: 24,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.9))",
  boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.15)",
  backdropFilter: "blur(24px)",
};
