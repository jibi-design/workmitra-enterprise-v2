// App name: Job Mitra
// File name: EmployerCompletedCareerRecordsCard.tsx

import type { CSSProperties } from "react";
import type { CareerEmploymentFeedbackTask } from "../../myStaff/storage/careerEmploymentFeedback.storage";
import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import { getFeedbackStatusForStaff } from "../helpers/employerCareerRecords.helpers";
import { ActionPill } from "../../../../shared/components/layout/designDna";

type Props = {
  records: StaffRecord[];
  feedbackTasks: CareerEmploymentFeedbackTask[];
  onOpenRecords: () => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export function EmployerCompletedCareerRecordsCard({
  records,
  feedbackTasks,
  onOpenRecords,
}: Props) {
  const feedbackPending = records.filter(
    (r) => getFeedbackStatusForStaff(r, feedbackTasks) === "pending",
  ).length;
  const feedbackCompleted = records.filter(
    (r) => getFeedbackStatusForStaff(r, feedbackTasks) === "completed",
  ).length;

  return (
    <section className="wm-er-card wm-career-card wm-career-card--employer wm-homeGlassCard--domainCareer" style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={EYEBROW_STYLE}>Closed records</div>
          <div style={TITLE_STYLE}>Completed Career Records</div>
          <div style={SUBTITLE_STYLE}>
            Keep exited employees, closed work history, and feedback separate from active
            workspaces.
          </div>
        </div>
        <span style={COUNT_BADGE_STYLE}>{records.length}</span>
      </div>

      <div style={SUMMARY_GRID_STYLE}>
        <SummaryChip
          label="Feedback pending"
          value={feedbackPending}
          active={feedbackPending > 0}
        />
        <SummaryChip
          label="Feedback saved"
          value={feedbackCompleted}
          active={feedbackCompleted > 0}
        />
      </div>

      <ActionPill domain="career" onClick={onOpenRecords}>
        Open Completed Records
      </ActionPill>

      {records.length === 0 && (
        <div style={EMPTY_NOTE_STYLE}>
          Exited employees will appear here after employment is closed.
        </div>
      )}
    </section>
  );
}

function SummaryChip({ label, value, active }: { label: string; value: number; active: boolean }) {
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
  background: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.1)",
  color: CAREER_BLUE_DEEP,
  fontSize: 14,
  fontWeight: 800,
  flexShrink: 0,
  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
};
const SUMMARY_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-10)",
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
