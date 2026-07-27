/** Job Mitra | EmployerShiftCandidateList — virtualized candidate review */

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import type {
  EmployeeShiftApplication,
  PriorityTag,
  ShiftQuickQuestion,
} from "../../shiftJobs/storage/employerShift.storage";
import { CandidateCard } from "./CandidateCard";
import { CandidatePulseRowChrome } from "./CandidatePulseRowChrome";
import { useShiftCandidatePulseAppId } from "../hooks/useShiftCandidatePulseAppId";
import { CandidateReviewEmptyState } from "./candidateReview/CandidateReviewEmptyState";
import { CandidateReviewToolbar } from "./candidateReview/CandidateReviewToolbar";
import { BackupPromotionHint, CompareModeBar } from "./candidateReview/CandidateListChrome";
import {
  applyCandidateReviewPriority,
  getCandidateReviewItems,
  getCandidateReviewSummary,
} from "./candidateReview/candidateReview.logic";
import type { CandidateReviewFilters } from "./candidateReview/candidateReview.types";
import { SlideOver, StatusBadge } from "../../../../shared/components/enterprise";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useNavigate } from "react-router-dom";

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

const ROW_ESTIMATE_PX = 168;
const LIST_HEIGHT_CSS = "min(560px, 70dvh)";

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
  const [quickApp, setQuickApp] = useState<EmployeeShiftApplication | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const targetedAppId = useShiftCandidatePulseAppId();
  const nav = useNavigate();

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

  // TanStack Virtual intentionally returns unstable function identities.
  // eslint-disable-next-line react-hooks/incompatible-library -- required for list virtualization
  const virtualizer = useVirtualizer({
    count: visibleApps.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 4,
  });

  const hasAnyCandidates = sourceApps.length > 0;
  const mode = getCandidateCardMode(tab);

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

      {visibleApps.length === 0 ? (
        <CandidateReviewEmptyState
          tab={tab}
          filters={reviewFilters}
          hasAnyCandidates={hasAnyCandidates}
          onReset={() => setReviewFilters(DEFAULT_REVIEW_FILTERS)}
          onRequestTabChange={onRequestTabChange}
        />
      ) : (
        <div
          ref={parentRef}
          data-testid="employer-shift-candidate-virtual-list"
          style={{
            height: LIST_HEIGHT_CSS,
            overflow: "auto",
            position: "relative",
            contain: "paint layout",
            willChange: "scroll-position",
            transform: "translateZ(0)",
          }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
              contain: "layout style",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const app = visibleApps[virtualRow.index];
              if (!app) return null;
              const compareSelected = compareIds.has(app.id);
              const compareDisabled = !compareSelected && compareIds.size >= 3;

              return (
                <div
                  key={app.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                    paddingBottom: 12,
                    contain: "layout paint style",
                  }}
                >
                  <CandidatePulseRowChrome
                    postId={postId}
                    appId={app.id}
                    targetedAppId={targetedAppId}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="wm-outlineBtn"
                          data-testid={`shift-applicant-quick-view-${app.id}`}
                          onClick={() => setQuickApp(app)}
                          style={{ minHeight: 32, fontSize: 11, fontWeight: 800 }}
                        >
                          Quick view
                        </button>
                      </div>
                      <CandidateCard
                        app={app}
                        mode={mode}
                        quickQuestions={quickQuestions}
                        showCompareSelector={compareMode}
                        isCompareSelected={compareSelected}
                        isCompareDisabled={compareDisabled}
                        onToggleCompare={onToggleCompare}
                        {...cardActions}
                      />
                    </div>
                  </CandidatePulseRowChrome>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SlideOver
        open={Boolean(quickApp)}
        onClose={() => setQuickApp(null)}
        title={quickApp?.profileSnapshot?.fullName?.trim() || "Applicant"}
        subtitle={quickApp?.profileSnapshot?.city || "Shift applicant snapshot"}
        testId="shift-applicant-slideover"
        footer={
          quickApp ? (
            <>
              <button type="button" className="wm-outlineBtn" onClick={() => setQuickApp(null)}>
                Close
              </button>
              <button
                type="button"
                className="wm-primarybtn"
                data-testid="shift-applicant-slideover-open-full"
                onClick={() => {
                  setQuickApp(null);
                  nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
                }}
              >
                Open full profile
              </button>
            </>
          ) : null
        }
      >
        {quickApp ? (
          <div style={{ display: "grid", gap: 10 }} data-testid="shift-applicant-slideover-body">
            <StatusBadge
              label={String(quickApp.status)}
              tone={quickApp.status === "confirmed" ? "active" : "pending"}
              accent="shift"
            />
            <div style={{ fontSize: 13 }}>
              Experience: {quickApp.profileSnapshot?.experience || "Not listed"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
              Skills: {(quickApp.profileSnapshot?.skills ?? []).join(", ") || "Not listed"}
            </div>
          </div>
        ) : null}
      </SlideOver>
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
