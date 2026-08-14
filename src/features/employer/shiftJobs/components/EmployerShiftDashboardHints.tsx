// App name: Job Mitra
// File name: EmployerShiftDashboardHints.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftDashboardHints.tsx

import type { CSSProperties, ReactNode } from "react";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import {
  shiftConfirmBannerCopy,
  shiftPipelineHasLaterWork,
} from "../helpers/shiftDashboard.smartResume";
import { getDashboardHintToneStyle, type HintTone } from "./EmployerShiftDashboardHints.tones";

type EmployerShiftDashboardHintsProps = {
  tab: DashboardTab;
  appliedCount: number;
  shortlistedCount: number;
  backupCount: number;
  selectedCount: number;
  remainingVacancies: number;
  alreadyAnalyzed: boolean;
  onGoToApplied: () => void;
  onGoToShortlisted: () => void;
  onGoToBackup: () => void;
  onGoToSelected: () => void;
};

type HintConfig = {
  readonly title: string;
  readonly message: string;
  readonly tone: HintTone;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "11px 12px",
  borderRadius: "var(--wm-radius-chip)",
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1.45,
};

const ACTION_STYLE: CSSProperties = {
  marginTop: 9,
  border: "none",
  borderRadius: "var(--wm-radius-pill)",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 950,
  color: "#ffffff",
  cursor: "pointer",
};

export function EmployerShiftDashboardHints({
  tab,
  appliedCount,
  shortlistedCount,
  backupCount,
  selectedCount,
  remainingVacancies,
  alreadyAnalyzed,
  onGoToApplied,
  onGoToShortlisted,
  onGoToBackup,
  onGoToSelected,
}: EmployerShiftDashboardHintsProps) {
  const hint = getHint({
    tab,
    appliedCount,
    shortlistedCount,
    backupCount,
    selectedCount,
    remainingVacancies,
    alreadyAnalyzed,
    onGoToApplied,
    onGoToShortlisted,
    onGoToBackup,
    onGoToSelected,
  });

  if (!hint) {
    return null;
  }

  return (
    <HintCard
      tone={hint.tone}
      title={hint.title}
      actionLabel={hint.actionLabel}
      onAction={hint.onAction}
    >
      {hint.message}
    </HintCard>
  );
}

function getHint({
  tab,
  appliedCount,
  shortlistedCount,
  backupCount,
  selectedCount,
  remainingVacancies,
  alreadyAnalyzed,
  onGoToApplied,
  onGoToShortlisted,
  onGoToBackup,
  onGoToSelected,
}: EmployerShiftDashboardHintsProps): HintConfig | null {
  if (tab === "applied" && appliedCount === 0) {
    if (
      shiftPipelineHasLaterWork({
        applied: appliedCount,
        shortlisted: shortlistedCount,
        backup: backupCount,
        selected: selectedCount,
      })
    ) {
      return {
        title: "Applied queue is clear",
        message:
          shortlistedCount > 0
            ? "New applicants are not waiting here. Open Shortlisted and tap Confirm Worker to fill the vacancy."
            : "The applied queue is empty because candidates already moved to later pipeline stages.",
        tone: "success",
        actionLabel: shortlistedCount > 0 ? "Go to Shortlist" : "View Confirmed",
        onAction: shortlistedCount > 0 ? onGoToShortlisted : onGoToSelected,
      };
    }
    return {
      title: "Waiting for applications",
      message:
        "No workers have applied yet. Keep the post open, make the shift details clear, and review applicants as soon as they arrive.",
      tone: "info",
    };
  }

  if (tab === "applied" && appliedCount > 0 && !alreadyAnalyzed) {
    return {
      title: "Applications are ready",
      message:
        "Run analysis or review manually. Move strong candidates to Shortlist, Backup, Confirmed, or Rejected based on fit.",
      tone: "success",
    };
  }

  if (tab === "applied" && alreadyAnalyzed && appliedCount > 0) {
    return {
      title: "Review recommended candidates",
      message:
        "Use search, filters, compare, and match labels. Confirm only within the vacancy limit and keep backup candidates separate.",
      tone: "success",
      actionLabel: shortlistedCount > 0 ? "View Shortlist" : undefined,
      onAction: shortlistedCount > 0 ? onGoToShortlisted : undefined,
    };
  }

  if (tab === "shortlisted" && shortlistedCount === 0) {
    return {
      title: "Shortlist is empty",
      message:
        "Shortlist should contain candidates you are seriously considering. Go to Applied and move suitable workers here first.",
      tone: "warning",
      actionLabel: appliedCount > 0 ? "Go to Applied" : undefined,
      onAction: appliedCount > 0 ? onGoToApplied : undefined,
    };
  }

  if (tab === "shortlisted" && shortlistedCount > 0) {
    const copy = shiftConfirmBannerCopy(shortlistedCount, remainingVacancies);
    return {
      title: copy.title,
      message: copy.message,
      tone: "success",
    };
  }

  if (tab === "backup" && backupCount === 0) {
    return {
      title: "Backup list is empty",
      message:
        "Backup candidates are useful when confirmed workers drop out. Move suitable non-selected candidates to Backup manually.",
      tone: "warning",
      actionLabel: appliedCount > 0 ? "Find candidates" : undefined,
      onAction: appliedCount > 0 ? onGoToApplied : undefined,
    };
  }

  if (tab === "backup" && backupCount > 0) {
    return {
      title: "Backup candidates are standby only",
      message:
        "Backup workers are not auto-confirmed. If a slot opens, confirm one backup candidate manually.",
      tone: "info",
      actionLabel: selectedCount > 0 ? "View Confirmed" : undefined,
      onAction: selectedCount > 0 ? onGoToSelected : undefined,
    };
  }

  if (tab === "selected" && selectedCount === 0) {
    return {
      title: "No confirmed workers yet",
      message:
        "Confirmed workers should appear only after final employer decision. Review shortlisted or applied candidates before confirming.",
      tone: "warning",
      actionLabel: shortlistedCount > 0 ? "Go to Shortlist" : "Go to Applied",
      onAction: shortlistedCount > 0 ? onGoToShortlisted : onGoToApplied,
    };
  }

  if (tab === "selected" && selectedCount > 0 && backupCount > 0) {
    return {
      title: "Confirmed team ready",
      message:
        "You have confirmed workers and backup candidates. If someone is replaced, review Backup and confirm manually.",
      tone: "success",
      actionLabel: "View Backup",
      onAction: onGoToBackup,
    };
  }

  return null;
}

function HintCard({
  tone,
  title,
  children,
  actionLabel,
  onAction,
}: {
  readonly tone: HintTone;
  readonly title: string;
  readonly children: ReactNode;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}) {
  const toneStyle = getDashboardHintToneStyle(tone);

  return (
    <div
      style={{
        ...CARD_STYLE,
        background: toneStyle.background,
        border: toneStyle.border,
        color: toneStyle.text,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: toneStyle.title }}>{title}</div>

      <div style={{ marginTop: 4 }}>{children}</div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            ...ACTION_STYLE,
            background: toneStyle.button,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
