// App name: Job Mitra
// File name: EmployerShiftCandidateList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftCandidateList.tsx

import { useMemo, useState } from "react";

import { PulseSectionResolver } from "../../../../features/pulse/PulseSectionResolver";
import { PulseTargetIndicator } from "../../../../features/pulse/PulseTargetIndicator";
import { PulseEvent, PulseSectionId } from "../../../../features/pulse/pulseRegistry";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import type {
  EmployeeShiftApplication,
  PriorityTag,
  ShiftQuickQuestion,
} from "../../shiftJobs/storage/employerShift.storage";
import { CandidateCard } from "./CandidateCard";
import { CandidateReviewEmptyState } from "./candidateReview/CandidateReviewEmptyState";
import { CandidateReviewToolbar } from "./candidateReview/CandidateReviewToolbar";
import {
  applyCandidateReviewPriority,
  getCandidateReviewItems,
  getCandidateReviewSummary,
} from "./candidateReview/candidateReview.logic";
import type { CandidateReviewFilters } from "./candidateReview/candidateReview.types";

type CandidateCardActions = {
  isBusy: boolean;
  onMoveToShortlist: (id: string) => void;
  onMoveToWaiting: (id: string) => void;
  onConfirm: (id: string) => void;
  onOpenGroup: () => void;
  onRemove: (id: string) => void;
  onReplace: (id: string) => void;
};

type EmployerShiftCandidateListProps = {
  postId: string;
  useSmartGroups: boolean;
  appliedApps: EmployeeShiftApplication[];
  tabApps: EmployeeShiftApplication[];
  tab: DashboardTab;
  priorityTags: Record<string, PriorityTag | undefined>;
  quickQuestions: ShiftQuickQuestion[];
  compareIds: Set<string>;
  onToggleCompare: (appId: string) => void;
  onOpenCompare: () => void;
  onPriorityTag: (appId: string, tag: PriorityTag | undefined) => void;
  cardActions: CandidateCardActions;
  onRequestTabChange: (tab: DashboardTab) => void;
};

const DEFAULT_REVIEW_FILTERS: CandidateReviewFilters = {
  query: "",
  match: "all",
  priority: "all",
  sort: "recommended",
};

export function EmployerShiftCandidateList({
  postId,
  useSmartGroups,
  appliedApps,
  tabApps,
  tab,
  priorityTags,
  quickQuestions,
  compareIds,
  onToggleCompare,
  onOpenCompare,
  cardActions,
  onRequestTabChange,
}: EmployerShiftCandidateListProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [reviewFilters, setReviewFilters] =
    useState<CandidateReviewFilters>(DEFAULT_REVIEW_FILTERS);

  const sourceApps = useMemo(() => {
    const baseApps = useSmartGroups ? appliedApps : tabApps;

    return applyCandidateReviewPriority(baseApps, priorityTags, useSmartGroups);
  }, [appliedApps, priorityTags, tabApps, useSmartGroups]);

  const visibleApps = useMemo(
    () => getCandidateReviewItems(sourceApps, reviewFilters),
    [reviewFilters, sourceApps],
  );

  const reviewSummary = useMemo(
    () => getCandidateReviewSummary(sourceApps, visibleApps, reviewFilters),
    [reviewFilters, sourceApps, visibleApps],
  );

  const hasAnyCandidates = sourceApps.length > 0;

  return (
    <div style={{ marginTop: 10, display: "grid", gap: 12, minHeight: 260 }}>
      <CandidateReviewToolbar
        filters={reviewFilters}
        summary={reviewSummary}
        onChange={setReviewFilters}
        onReset={() => setReviewFilters(DEFAULT_REVIEW_FILTERS)}
      />

      <CompareModeBar
        enabled={compareMode}
        selectedCount={compareIds.size}
        onToggle={() => setCompareMode((current) => !current)}
        onOpenCompare={onOpenCompare}
      />

      {tab === "backup" && visibleApps.length > 0 && <BackupPromotionHint />}

      {visibleApps.length === 0 && (
        <CandidateReviewEmptyState
          tab={tab}
          filters={reviewFilters}
          hasAnyCandidates={hasAnyCandidates}
          onReset={() => setReviewFilters(DEFAULT_REVIEW_FILTERS)}
          onRequestTabChange={onRequestTabChange}
        />
      )}

      {visibleApps.map((app) => {
        const compareSelected = compareIds.has(app.id);
        const compareDisabled = !compareSelected && compareIds.size >= 3;

        return (
          <PulseSectionResolver
            key={app.id}
            notificationId={PulseEvent.SHIFT_APPLICATION_RECEIVED}
            sectionId={PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD}
            postId={postId}
            appId={app.id}
          >
            <div style={{ position: "relative" }}>
              <PulseTargetIndicator
                notificationId={PulseEvent.SHIFT_APPLICATION_RECEIVED}
                postId={postId}
                appId={app.id}
                sectionId={PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD}
              />

              <CandidateCard
                app={app}
                mode={getCandidateCardMode(tab)}
                quickQuestions={quickQuestions}
                showCompareSelector={compareMode}
                isCompareSelected={compareSelected}
                isCompareDisabled={compareDisabled}
                onToggleCompare={onToggleCompare}
                {...cardActions}
              />
            </div>
          </PulseSectionResolver>
        );
      })}
    </div>
  );
}

function getCandidateCardMode(
  tab: DashboardTab,
): "applied" | "shortlist" | "waiting" | "confirmed" | "rejected" {
  if (tab === "shortlisted") return "shortlist";
  if (tab === "selected") return "confirmed";
  if (tab === "backup") return "waiting";
  if (tab === "rejected") return "rejected";
  return "applied";
}

function CompareModeBar({
  enabled,
  selectedCount,
  onToggle,
  onOpenCompare,
}: {
  enabled: boolean;
  selectedCount: number;
  onToggle: () => void;
  onOpenCompare: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "10px 11px",
        borderRadius: 16,
        border: "1px solid rgba(22,163,74,0.14)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.64), rgba(255,255,255,0.98))",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          border: "1px solid rgba(22,163,74,0.18)",
          background: enabled ? "#16a34a" : "#ffffff",
          color: enabled ? "#ffffff" : "#166534",
          borderRadius: 999,
          padding: "8px 11px",
          fontSize: 11,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {enabled ? "Exit Compare" : "Compare Applicants"}
      </button>

      <button
        type="button"
        onClick={onOpenCompare}
        disabled={selectedCount < 2}
        style={{
          border: "none",
          background: selectedCount >= 2 ? "#0f172a" : "rgba(15,23,42,0.12)",
          color: "#ffffff",
          borderRadius: 999,
          padding: "8px 11px",
          fontSize: 11,
          fontWeight: 900,
          cursor: selectedCount >= 2 ? "pointer" : "not-allowed",
        }}
      >
        Open Compare ({selectedCount}/3)
      </button>

      <div style={{ fontSize: 11, fontWeight: 750, color: "var(--wm-er-muted)" }}>
        Select 2–3 applicants to compare answers and profile snapshots.
      </div>
    </div>
  );
}

function BackupPromotionHint() {
  return (
    <div
      className="wm-er-card"
      style={{
        padding: 14,
        borderRadius: 20,
        border: "1px solid rgba(217,119,6,0.18)",
        background: "linear-gradient(180deg, rgba(255,251,235,0.9), rgba(255,255,255,0.98))",
        boxShadow: "0 12px 26px rgba(217,119,6,0.08)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 950, color: "#92400e" }}>
        Backup candidates are ready
      </div>

      <div
        style={{ marginTop: 6, fontSize: 11, fontWeight: 750, color: "#b45309", lineHeight: 1.5 }}
      >
        If a confirmed worker is replaced, review this list and use Confirm manually. Job Mitra will
        not auto-confirm a backup worker without employer action.
      </div>
    </div>
  );
}
