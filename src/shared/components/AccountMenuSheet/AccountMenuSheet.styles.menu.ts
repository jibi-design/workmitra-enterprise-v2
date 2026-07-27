/** Job Mitra | AccountMenuSheet menu item styles */

import type { CSSProperties } from "react";

export const MENU_LIST_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: 4,
};

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

export const MENU_TITLE_BASE_STYLE: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-neutral-700)",
  lineHeight: 1.3,
};

export const MENU_SUB_STYLE: CSSProperties = {
  fontSize: 11,
  color: "var(--wm-neutral-400)",
  marginTop: 2,
  fontWeight: 500,
  lineHeight: 1.3,
};

export const DIVIDER_STYLE: CSSProperties = {
  height: 1,
  background: "var(--wm-neutral-200)",
  margin: "2px 8px",
};

export const CHEVRON_STYLE: CSSProperties = {
  fontSize: 18,
  color: "var(--wm-neutral-300)",
  flexShrink: 0,
  marginLeft: "auto",
  lineHeight: 1,
};
