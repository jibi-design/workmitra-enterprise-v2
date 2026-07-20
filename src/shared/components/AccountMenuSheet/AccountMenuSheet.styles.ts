/** Job Mitra | AccountMenuSheet.styles.ts — dual-tier material engine */

import type { CSSProperties } from "react";

import { DESIGN_TOKENS } from "../../../app/theme/designTokens";

import type { AccountMenuRole } from "./AccountMenuSheet.types";

/* ------------------------------------------------ */

/* Overlay — dim + wm-blur-sm                         */

/* ------------------------------------------------ */

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

/* ------------------------------------------------ */

/* Sheet — role-aware glass (employee flat / employer depth) */

/* ------------------------------------------------ */

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

/* ------------------------------------------------ */

/* Drag handle pill                                  */

/* ------------------------------------------------ */

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

/* ------------------------------------------------ */

/* Header identity card                              */

/* ------------------------------------------------ */

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

/* Avatar — 52px, accommodates both photo and initials */

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

/* Name — bold */

export const NAME_STYLE: CSSProperties = {
  fontSize: 16,

  fontWeight: 800,

  color: "var(--wm-neutral-900)",

  lineHeight: 1.2,

  letterSpacing: -0.2,
};

/* Role badge — emerald (employee) / purple (employer) */

export const ROLE_BADGE_BASE: CSSProperties = {
  display: "inline-block",

  padding: "3px 10px",

  borderRadius: 999,

  fontSize: 11,

  fontWeight: 700,

  lineHeight: 1.5,
};

/* Active session dot */

export const SESSION_DOT_STYLE: CSSProperties = {
  width: 9,

  height: 9,

  borderRadius: "50%",

  flexShrink: 0,

  alignSelf: "flex-start",

  marginTop: 4,
};

/* ------------------------------------------------ */

/* Menu list + items                                 */

/* ------------------------------------------------ */

export const MENU_LIST_STYLE: CSSProperties = {
  display: "flex",

  flexDirection: "column",

  marginTop: 4,
};

/* Taller tap targets: py-3.5 equivalent */

export const MENU_ITEM_STYLE: CSSProperties = {
  display: "flex",

  alignItems: "center",

  gap: 14,

  width: "100%",

  padding: "14px 8px",

  background: "none",

  border: "none",

  cursor: "pointer",

  textAlign: "left",

  borderRadius: 12,
};

/* Icon box — slightly larger */

export const ICON_BOX_BASE_STYLE: CSSProperties = {
  width: 40,

  height: 40,

  borderRadius: 12,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  flexShrink: 0,
};

export const MENU_TEXT_WRAP_STYLE: CSSProperties = {
  flex: 1,

  minWidth: 0,
};

/* Title */

export const MENU_TITLE_BASE_STYLE: CSSProperties = {
  fontSize: 14,

  fontWeight: 700,

  color: "var(--wm-neutral-700)",

  lineHeight: 1.3,
};

/* Sub */

export const MENU_SUB_STYLE: CSSProperties = {
  fontSize: 11,

  color: "var(--wm-neutral-400)",

  marginTop: 2,

  fontWeight: 500,

  lineHeight: 1.3,
};

/* Divider — very subtle */

export const DIVIDER_STYLE: CSSProperties = {
  height: 1,

  background: "var(--wm-neutral-200)",

  margin: "2px 8px",
};

/* Chevron — pale */

export const CHEVRON_STYLE: CSSProperties = {
  fontSize: 18,

  color: "var(--wm-neutral-300)",

  flexShrink: 0,

  marginLeft: "auto",

  lineHeight: 1,
};
