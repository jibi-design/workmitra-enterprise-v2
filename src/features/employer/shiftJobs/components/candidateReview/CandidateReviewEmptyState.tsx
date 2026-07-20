// App name: Job Mitra
// File name: CandidateReviewEmptyState.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateReview\CandidateReviewEmptyState.tsx

import type { CSSProperties } from "react";
import type { DashboardTab } from "../../helpers/shiftDashboardHelpers";
import type { CandidateReviewFilters } from "./candidateReview.types";
import { isCandidateReviewFilterActive } from "./candidateReview.logic";

type CandidateReviewEmptyStateProps = {
  readonly tab: DashboardTab;
  readonly filters: CandidateReviewFilters;
  readonly hasAnyCandidates: boolean;
  readonly onReset: () => void;
  readonly onRequestTabChange: (tab: DashboardTab) => void;
};

type EmptyCopy = {
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly actionTab?: DashboardTab;
  readonly checklist: readonly string[];
};

const CARD_STYLE: CSSProperties = {
  padding: 18,
  textAlign: "center",
  minHeight: 180,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 22,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,0.99))",
};

const ACTION_BUTTON_STYLE: CSSProperties = {
  marginTop: 13,
  border: "none",
  borderRadius: 999,
  background: "#16a34a",
  color: "#ffffff",
  padding: "10px 13px",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
};

const CHECKLIST_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 6,
  textAlign: "left",
};

export function CandidateReviewEmptyState({
  tab,
  filters,
  hasAnyCandidates,
  onReset,
  onRequestTabChange,
}: CandidateReviewEmptyStateProps) {
  const filteredOut = hasAnyCandidates && isCandidateReviewFilterActive(filters);
  const copy = filteredOut ? getFilteredCopy() : getTabCopy(tab);
  const actionButton =
    !filteredOut && copy.actionLabel && copy.actionTab
      ? { label: copy.actionLabel, tab: copy.actionTab }
      : null;

  return (
    <div className="wm-er-card" style={CARD_STYLE}>
      <div style={{ maxWidth: 370 }}>
        <div style={{ fontSize: 15, fontWeight: 950, color: "var(--wm-er-text)" }}>
          {copy.title}
        </div>

        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            fontWeight: 750,
            color: "var(--wm-er-muted)",
            lineHeight: 1.55,
          }}
        >
          {copy.message}
        </div>

        {copy.checklist.length > 0 && (
          <div style={CHECKLIST_STYLE}>
            {copy.checklist.map((item) => (
              <div
                key={item}
                style={{
                  padding: "8px 9px",
                  borderRadius: 12,
                  background: "rgba(248,250,252,0.92)",
                  border: "1px solid rgba(148,163,184,0.16)",
                  color: "var(--wm-er-muted)",
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {filteredOut && (
          <button type="button" onClick={onReset} style={ACTION_BUTTON_STYLE}>
            Clear filters
          </button>
        )}

        {actionButton && (
          <button
            type="button"
            onClick={() => onRequestTabChange(actionButton.tab)}
            style={ACTION_BUTTON_STYLE}
          >
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
}

function getFilteredCopy(): EmptyCopy {
  return {
    title: "No matching candidates",
    message:
      "Your search or filters are hiding all candidates. Clear filters or try a broader search term.",
    checklist: [
      "Try removing the priority filter.",
      "Search by city, skill, name, or candidate ID.",
      "Use Recommended sort after clearing filters.",
    ],
  };
}

function getTabCopy(tab: DashboardTab): EmptyCopy {
  if (tab === "applied") {
    return {
      title: "No new applicants yet",
      message:
        "Applications will appear here when workers apply. Keep the shift post clear and review applicants quickly when they arrive.",
      checklist: [
        "Make sure pay, location, time, and requirements are easy to understand.",
        "Do not close the post early if you still need workers.",
        "When applications arrive, use filters and compare mode to review faster.",
      ],
    };
  }

  if (tab === "shortlisted") {
    return {
      title: "No shortlisted candidates",
      message:
        "Shortlist should contain workers you are seriously considering before final confirmation.",
      actionLabel: "Go to Applied",
      actionTab: "applied",
      checklist: [
        "Review Applied candidates first.",
        "Move suitable workers to Shortlist instead of confirming too quickly.",
        "Keep Backup separate for standby candidates.",
      ],
    };
  }

  if (tab === "backup") {
    return {
      title: "No backup candidates yet",
      message: "Backup candidates help you recover if a confirmed worker drops out.",
      actionLabel: "Go to Applied",
      actionTab: "applied",
      checklist: [
        "Use Backup for suitable standby workers.",
        "Backup workers are not auto-confirmed.",
        "If a confirmed slot opens, confirm a backup manually.",
      ],
    };
  }

  if (tab === "selected") {
    return {
      title: "No confirmed workers",
      message:
        "Confirmed workers should appear only after you make a final employer decision within the vacancy limit.",
      actionLabel: "Review candidates",
      actionTab: "shortlisted",
      checklist: [
        "Confirm only after checking candidate fit.",
        "Do not exceed the vacancy count.",
        "Keep a backup list before replacing workers.",
      ],
    };
  }

  if (tab === "rejected") {
    return {
      title: "No rejected candidates",
      message: "Candidates you reject will appear here for record keeping.",
      actionLabel: "Go to Applied",
      actionTab: "applied",
      checklist: [
        "Reject only after review.",
        "Use Shortlist or Backup for candidates who may still be useful.",
      ],
    };
  }

  return {
    title: "No candidates here",
    message: "There are no candidates in this section right now.",
    checklist: [
      "Review other tabs.",
      "Use search and filters only after candidates are available.",
    ],
  };
}
