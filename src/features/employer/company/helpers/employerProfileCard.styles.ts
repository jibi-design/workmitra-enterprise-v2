/** Mitra Executive card shell for employer profile sections. */

export const EXECUTIVE_CARD_SHELL = {
  marginTop: 12,
  padding: 16,
  borderRadius: "var(--wm-radius-employee-card)",
  background: "rgba(255,255,255,0.74)",
  border: "1px solid rgba(148,163,184,0.16)",
  boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
} as const;

export const EXECUTIVE_SECTION_KICKER = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-emp-muted, #64748b)",
  letterSpacing: 0.6,
  textTransform: "uppercase",
} as const;

export const EXECUTIVE_SECTION_TITLE = {
  marginTop: 4,
  fontSize: 17,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1.25,
} as const;

export const EXECUTIVE_HELPER = {
  marginTop: 6,
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.55,
  fontWeight: 500,
} as const;
