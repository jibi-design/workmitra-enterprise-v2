/** Job Mitra | designTokens.ts — TS bridge to tokens.css (CSS vars are the single source of truth) */

import type { CSSProperties } from "react";

const blurSm = "blur(var(--wm-blur-sm)) var(--wm-glass-saturate)";

const blurMd = "blur(var(--wm-blur-md)) var(--wm-glass-saturate)";

const blurLg = "blur(var(--wm-blur-lg)) var(--wm-glass-saturate)";

export const DESIGN_TOKENS = {
  colors: {
    background: "var(--wm-neutral-50)",

    textDark: "var(--wm-neutral-900)",

    textMuted: "var(--wm-neutral-500)",

    borderLight: "var(--wm-glass-border)",

    borderMedium: "var(--wm-neutral-200)",

    employee: {
      primary: "var(--wm-brand-600)",

      bgTint: "var(--wm-emp-glass-bg)",

      borderTint: "var(--wm-glass-border)",
    },

    employer: {
      primary: "var(--wm-vault-accent)",

      bgTint: "var(--wm-er-glass-bg)",

      borderTint: "var(--wm-glass-border)",
    },
  },

  geometry: {
    radiusPanel: 24,

    radiusCard: 20,

    radiusCardEmployer: 24,

    radiusButton: 12,

    pagePadding: 16,

    maxContentWidth: 520,

    sectionGap: 16,

    itemGap: 16,
  },

  blur: {
    sm: blurSm,

    md: blurMd,

    lg: blurLg,
  },

  shadows: {
    panel: "var(--wm-shadow-md)",

    card: "var(--wm-emp-card-shadow)",

    cardEmployer: "var(--wm-er-card-shadow)",

    floating: "var(--wm-er-elevation-shadow)",

    button: "var(--wm-emp-card-shadow)",

    surfaceEmployee: "var(--wm-emp-surface-shadow)",

    surfaceEmployer: "var(--wm-er-surface-shadow)",
  },

  glass: {
    border: "var(--wm-material-glass-border)",

    background: "var(--wm-emp-glass-bg-strong)",

    backgroundEmployee: "var(--wm-emp-glass-bg)",

    backgroundEmployeeStrong: "var(--wm-emp-glass-bg-strong)",

    backgroundEmployer: "var(--wm-er-glass-bg)",

    backgroundEmployerStrong: "var(--wm-er-glass-bg-strong)",

    backdropFilterNav: blurMd,

    backdropFilterModal: blurLg,

    backdropFilterToast: blurSm,

    backdropFilter: blurMd,
  },
};

export const SHARED_STYLES = {
  glassCard: {
    background: DESIGN_TOKENS.glass.backgroundEmployeeStrong,

    backdropFilter: DESIGN_TOKENS.glass.backdropFilterNav,

    WebkitBackdropFilter: DESIGN_TOKENS.glass.backdropFilterNav,

    border: DESIGN_TOKENS.glass.border,

    borderRadius: DESIGN_TOKENS.geometry.radiusCard,

    boxShadow: DESIGN_TOKENS.shadows.card,
  } as CSSProperties,

  glassCardEmployer: {
    background: DESIGN_TOKENS.glass.backgroundEmployerStrong,

    backdropFilter: DESIGN_TOKENS.glass.backdropFilterModal,

    WebkitBackdropFilter: DESIGN_TOKENS.glass.backdropFilterModal,

    border: DESIGN_TOKENS.glass.border,

    borderRadius: DESIGN_TOKENS.geometry.radiusCardEmployer,

    boxShadow: DESIGN_TOKENS.shadows.cardEmployer,
  } as CSSProperties,
};
