// App name: Job Mitra
// File name: EmployerShiftDashboardHints.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftDashboardHints.tsx

import type { CSSProperties, ReactNode } from "react";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";

type EmployerShiftDashboardHintsProps = {
  tab: DashboardTab;
  appliedCount: number;
  shortlistedCount: number;
  backupCount: number;
  selectedCount: number;
  alreadyAnalyzed: boolean;
  onGoToApplied: () => void;
  onGoToShortlisted: () => void;
  onGoToBackup: () => void;
  onGoToSelected: () => void;
};

type HintTone = "success" | "warning" | "info";

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
  borderRadius: 16,
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1.45,
};

const ACTION_STYLE: CSSProperties = {
  marginTop: 9,
  border: "none",
  borderRadius: 999,
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
  alreadyAnalyzed,
  onGoToApplied,
  onGoToShortlisted,
  onGoToBackup,
  onGoToSelected,
}: EmployerShiftDashboardHintsProps): HintConfig | null {
  if (tab === "applied" && appliedCount === 0) {
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
  const toneStyle = getToneStyle(tone);

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

function getToneStyle(tone: HintTone): {
  readonly title: string;
  readonly text: string;
  readonly background: string;
  readonly border: string;
  readonly button: string;
} {
  if (tone === "success") {
    return {
      title: "#166534",
      text: "#166534",
      background: "rgba(22,163,74,0.06)",
      border: "1px solid rgba(22,163,74,0.14)",
      button: "#16a34a",
    };
  }

  if (tone === "warning") {
    return {
      title: "#92400e",
      text: "#92400e",
      background: "rgba(255,251,235,0.88)",
      border: "1px solid rgba(217,119,6,0.18)",
      button: "#b45309",
    };
  }

  return {
    title: "#1d4ed8",
    text: "#1e3a8a",
    background: "rgba(239,246,255,0.86)",
    border: "1px solid rgba(29,78,216,0.14)",
    button: "#1d4ed8",
  };
}
