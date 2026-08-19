// App name: Job Mitra
// File name: EmployerCareerPostListCard.tsx

import type { CSSProperties } from "react";
import { ActionPill } from "../../../../shared/components/layout/designDna";

type Props = {
  summary: { total: number; active: number; past: number };
  onOpenPosts: () => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export function EmployerCareerPostListCard({ summary, onOpenPosts }: Props) {
  const hasPosts = summary.total > 0;

  return (
    <section
      className="wm-er-card wm-career-card wm-career-card--employer wm-press-card wm-homeGlassCard--domainCareer"
      style={CARD_STYLE}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={EYEBROW_STYLE}>Career posts</div>
          <div style={TITLE_STYLE}>Career Post List</div>
          <div style={SUBTITLE_STYLE}>
            Open all Career posts in one place. Active posts appear first, and filled, paused,
            draft, and closed posts stay available for review.
          </div>
        </div>
        <span style={COUNT_BADGE_STYLE}>{summary.total}</span>
      </div>

      <div style={{ position: "relative", zIndex: 1, ...SUMMARY_GRID_STYLE }}>
        <SummaryChip label="Active" value={summary.active} />
        <SummaryChip label="Past records" value={summary.past} />
      </div>

      <div style={{ position: "relative", zIndex: 1, ...ACTION_ROW_STYLE }}>
        <ActionPill domain="career" onClick={onOpenPosts}>
          Open Post List
        </ActionPill>
      </div>

      {!hasPosts && (
        <div style={{ position: "relative", zIndex: 1, ...EMPTY_NOTE_STYLE }}>
          No Career post yet. Create one job first, then this list will show active and old posts
          clearly.
        </div>
      )}
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  const active = value > 0;
  return (
    <div style={SUMMARY_CHIP_STYLE}>
      <div style={SUMMARY_LABEL_STYLE}>{label}</div>
      <div style={{ ...SUMMARY_VALUE_STYLE, color: active ? CAREER_BLUE : "rgba(15,23,42,0.4)" }}>
        {value}
      </div>
    </div>
  );
}

// ULTRA-PREMIUM STYLES
const CARD_STYLE: CSSProperties = {
  padding: 18,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  display: "grid",
  gap: 14,
  position: "relative",
  overflow: "hidden",
};
const EYEBROW_STYLE: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "var(--wm-radius-button)",
  background: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.12)",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: CAREER_BLUE_DEEP,
};
const TITLE_STYLE: CSSProperties = {
  marginTop: 8,
  fontSize: 17,
  fontWeight: 800,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
};
const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 500,
  color: CAREER_MUTED,
  lineHeight: 1.45,
};
const COUNT_BADGE_STYLE: CSSProperties = {
  minWidth: 38,
  height: 38,
  borderRadius: "var(--wm-radius-button)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  boxShadow: "0 4px 10px rgba(37,99,235,0.06), inset 0 1px 2px rgba(255,255,255,0.9)",
  color: CAREER_BLUE,
  fontSize: 14,
  fontWeight: 800,
  flexShrink: 0,
};
const SUMMARY_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};
const SUMMARY_CHIP_STYLE: CSSProperties = {
  minWidth: 0,
  padding: "14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.8)",
};
const SUMMARY_LABEL_STYLE: CSSProperties = { fontSize: 11.5, fontWeight: 700, color: CAREER_MUTED };
const SUMMARY_VALUE_STYLE: CSSProperties = { marginTop: 4, fontSize: 19, fontWeight: 800 };
const ACTION_ROW_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "var(--wm-space-10)",
  marginTop: 2,
};
const EMPTY_NOTE_STYLE: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(37, 99, 235, 0.05)",
  border: "1px solid rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.45,
};
