import {
  CAREER_ACCENT,
  CAREER_MUTED,
  CAREER_TEXT,
  SECTION_STYLE,
} from "./CareerPostDetailSections.styles";

export function PremiumSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="wm-ee-card" style={SECTION_STYLE}>
      <div style={{ fontSize: 16, fontWeight: 800, color: CAREER_TEXT }}>{title}</div>
      {subtitle && (
        <div
          style={{
            marginTop: 4,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
            color: CAREER_MUTED,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}
      {!subtitle && <div style={{ height: 16 }} />}
      {children}
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.25fr",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: CAREER_MUTED }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: CAREER_TEXT,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 12px",
        borderRadius: "var(--wm-radius-pill)",
        background: "rgba(29,78,216,0.08)",
        border: "1px solid rgba(29,78,216,0.12)",
        color: CAREER_ACCENT,
      }}
    >
      {children}
    </span>
  );
}

export function RequirementPill({ label, tone }: { label: string; tone: "blue" | "neutral" }) {
  const isBlue = tone === "blue";

  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: "var(--wm-radius-pill)",
        background: isBlue ? "rgba(29,78,216,0.08)" : "#f1f5f9",
        border: isBlue ? "1px solid rgba(29,78,216,0.12)" : "1px solid #e2e8f0",
        color: isBlue ? CAREER_ACCENT : CAREER_TEXT,
      }}
    >
      {label}
    </span>
  );
}
