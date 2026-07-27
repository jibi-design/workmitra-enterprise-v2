/** Job Mitra | AccountMenuSheet overlay + sheet styles */

import type { CSSProperties } from "react";
import { DESIGN_TOKENS } from "../../../app/theme/designTokens";
import type { AccountMenuRole } from "./AccountMenuSheet.types";

export function getOverlayStyle(): CSSProperties {
  return {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: DESIGN_TOKENS.blur.sm,
    WebkitBackdropFilter: DESIGN_TOKENS.blur.sm,
    opacity: 0,
    transition: "opacity 0.28s ease",
  };
}

export function getSheetStyle(role: AccountMenuRole): CSSProperties {
  const isEmployer = role === "employer";

  return {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    maxHeight: "62vh",
    background: isEmployer
      ? DESIGN_TOKENS.glass.backgroundEmployerStrong
      : DESIGN_TOKENS.glass.backgroundEmployeeStrong,
    backdropFilter: DESIGN_TOKENS.glass.backdropFilterModal,
    WebkitBackdropFilter: DESIGN_TOKENS.glass.backdropFilterModal,
    borderRadius: "var(--wm-radius-sheet-top) var(--wm-radius-sheet-top) 0 0",
    borderTop: DESIGN_TOKENS.glass.border,
    padding: "0 20px 48px",
    boxShadow: isEmployer ? DESIGN_TOKENS.shadows.floating : DESIGN_TOKENS.shadows.card,
    transform: "translateY(100%)",
    transition: "transform var(--wm-motion-base, 0.32s) var(--wm-motion-spring)",
    overflowY: "auto",
  };
}

export const HANDLE_WRAP_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "12px 0 20px",
  cursor: "grab",
};

export const HANDLE_BAR_STYLE: CSSProperties = {
  width: 36,
  height: 4,
  borderRadius: 999,
  background: "var(--wm-neutral-300)",
};

export const HEADER_CARD_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  borderRadius: 20,
  background: "var(--wm-neutral-50)",
  border: DESIGN_TOKENS.glass.border,
  marginBottom: 6,
  boxShadow: DESIGN_TOKENS.shadows.card,
};

export const AVATAR_BASE_STYLE: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
  fontSize: 19,
  fontWeight: 800,
  letterSpacing: -0.5,
};

export const NAME_STYLE: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: "var(--wm-neutral-900)",
  lineHeight: 1.2,
  letterSpacing: -0.2,
};

export const ROLE_BADGE_BASE: CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.5,
};

export const SESSION_DOT_STYLE: CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  flexShrink: 0,
  alignSelf: "flex-start",
  marginTop: 4,
};
