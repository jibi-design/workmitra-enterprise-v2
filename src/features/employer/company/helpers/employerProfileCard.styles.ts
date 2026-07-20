/** Mitra Executive card shell for employer profile sections. */

export const EXECUTIVE_CARD_SHELL = {
  marginTop: 12,
  padding: 18,
  borderRadius: 24,
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(250,245,255,0.9) 52%, rgba(255,255,255,0.88) 100%)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
} as const;

export const EXECUTIVE_SECTION_KICKER = {
  fontSize: 11,
  fontWeight: 900,
  color: "#7c3aed",
  letterSpacing: 0.8,
  textTransform: "uppercase",
} as const;

export const EXECUTIVE_SECTION_TITLE = {
  marginTop: 4,
  fontSize: 17,
  fontWeight: 950,
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
