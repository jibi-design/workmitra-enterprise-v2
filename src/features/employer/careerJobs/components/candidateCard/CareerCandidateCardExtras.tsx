import type { CareerCandidateCardProps } from "../../types/careerCandidateCard.types";
import { CAREER_BLUE, CAREER_MUTED, CAREER_TEXT } from "./careerCandidateCard.constants";

export function CareerCandidateCoverNote({
  coverNote,
  open,
  onToggle,
}: {
  coverNote: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: "var(--wm-radius-button)",
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="wm-candidate-toggle-btn"
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: CAREER_MUTED,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>📄</span> Candidate Cover Note
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: CAREER_BLUE }}>
          {open ? "Hide" : "View"}
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 12px 12px",
            fontSize: 13,
            fontWeight: 600,
            color: CAREER_TEXT,
            lineHeight: 1.5,
          }}
        >
          {coverNote.trim()}
        </div>
      )}
    </div>
  );
}

export function CareerCandidateStatusNotes({
  tab,
  rejectionReason,
  employerNotes,
}: {
  tab: CareerCandidateCardProps["tab"];
  rejectionReason?: string;
  employerNotes?: string;
}) {
  return (
    <>
      {tab === "rejected" && rejectionReason && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            fontSize: 12,
            color: "#dc2626",
            fontWeight: 700,
          }}
        >
          Reason: {rejectionReason}
        </div>
      )}
      {employerNotes && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            fontSize: 12,
            color: CAREER_MUTED,
            fontStyle: "italic",
            fontWeight: 600,
          }}
        >
          Notes: {employerNotes}
        </div>
      )}
    </>
  );
}

export function CareerCandidateBackupBanner() {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "10px 12px",
        borderRadius: "var(--wm-radius-10)",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        color: "#92400e",
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 14 }}>💡</span> Backup suggestion. Candidate remains in Applied and
      can be manually shortlisted.
    </div>
  );
}
