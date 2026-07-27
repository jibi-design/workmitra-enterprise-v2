// App name: Job Mitra
// File name: CareerPostCandidateList.tsx
// Wave 1 SC-3 — SHOW_LIMIT=25 + Show more

import { useEffect, useState } from "react";
import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import { SlideOver } from "../../../../shared/components/enterprise";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import { getCandidateWorkerName } from "../helpers/careerCandidateCard.helpers";
import { CareerCandidateCard } from "./CareerCandidateCard";
import { CareerCompareToolbar } from "./CareerCompareToolbar";
import type { CareerTab } from "./CareerPipelineTabs";
import {
  CANDIDATE_SHOW_LIMIT,
  CareerApplicantQuickView,
  EmptyCandidateState,
  getCompareLabel,
  getTabSectionLabel,
  isCompareAllowed,
} from "./CareerPostCandidateList.helpers";

type CareerPostCandidateListProps = {
  apps: CareerApplication[];
  post: CareerJobPost;
  tab: CareerTab;
  isBusy: boolean;
  compareMode: boolean;
  compareIds: Set<string>;
  backupSuggestionIds?: Set<string>;
  onStartCompare: () => void;
  onCancelCompare: () => void;
  onToggleCompare: (appId: string) => void;
  onOpenCompare: () => void;
  onShortlist: (appId: string) => void;
  onRemoveFromShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onBulkReject?: (appIds: string[]) => void;
  onScheduleInterview: (appId: string, roundNumber: number) => void;
  onRecordResult: (appId: string, roundNumber: number) => void;
  onSendOffer: (appId: string) => void;
  onHire: (appId: string) => void;
  onEditNotes: (appId: string) => void;
};

const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e3a8a";

export function CareerPostCandidateList({
  apps,
  post,
  tab,
  isBusy,
  compareMode,
  compareIds,
  backupSuggestionIds = new Set<string>(),
  onStartCompare,
  onCancelCompare,
  onToggleCompare,
  onOpenCompare,
  onShortlist,
  onRemoveFromShortlist,
  onReject,
  onBulkReject,
  onScheduleInterview,
  onRecordResult,
  onSendOffer,
  onHire,
  onEditNotes,
}: CareerPostCandidateListProps) {
  const compareAllowed = isCompareAllowed(tab);
  const showCompareToolbar = compareAllowed && apps.length >= 2;
  const showCompareSelector = showCompareToolbar && compareMode;
  const [quickApp, setQuickApp] = useState<CareerApplication | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(CANDIDATE_SHOW_LIMIT);

  useEffect(() => {
    setVisibleLimit(CANDIDATE_SHOW_LIMIT);
  }, [tab, post.id]);

  const visibleApps = apps.slice(0, visibleLimit);
  const hasMore = apps.length > visibleLimit;
  const canBulkReject =
    Boolean(onBulkReject) &&
    apps.length > 1 &&
    (tab === "applied" || tab === "backup" || tab === "shortlisted" || tab === "interview");

  return (
    <section style={{ marginTop: 16, display: "grid", gap: 16 }}>
      {apps.length === 0 && <EmptyCandidateState tab={tab} post={post} />}

      {apps.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 4,
            borderBottom: "1px solid rgba(29,78,216,0.1)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>
            {getTabSectionLabel(tab)}
          </div>
          <span className="wm-career-pill wm-career-pill--pay">
            {Math.min(visibleLimit, apps.length)} / {apps.length}
          </span>
        </div>
      )}

      {canBulkReject ? (
        <button
          type="button"
          className="wm-outlineBtn"
          data-testid="career-candidate-bulk-reject"
          aria-label={`Reject all ${apps.length} candidates in this tab`}
          disabled={isBusy}
          onClick={() => onBulkReject?.(apps.map((app) => app.id))}
          style={{
            minHeight: 44,
            fontWeight: 800,
            color: "var(--wm-error, #dc2626)",
            borderColor: "rgba(220,38,38,0.25)",
          }}
        >
          Reject all in this tab ({apps.length})
        </button>
      ) : null}

      {showCompareToolbar && (
        <CareerCompareToolbar
          compareMode={compareMode}
          selectedCount={compareIds.size}
          onStartCompare={onStartCompare}
          onCancelCompare={onCancelCompare}
          onOpenCompare={onOpenCompare}
        />
      )}

      {visibleApps.map((app) => (
        <div key={app.id} style={{ position: "relative" }}>
          <PulseTargetIndicator
            notificationId="APPLICATION_RECEIVED"
            postId={post.id}
            appId={app.id}
          />

          {showCompareSelector && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                padding: "8px 12px",
                borderRadius: "var(--wm-radius-chip)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 900,
                color: compareIds.has(app.id) ? CAREER_BLUE_DEEP : CAREER_MUTED,
                background: compareIds.has(app.id)
                  ? "rgba(37,99,235,0.1)"
                  : "rgba(255,255,255,0.8)",
                border: compareIds.has(app.id)
                  ? "1px solid rgba(37,99,235,0.2)"
                  : "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={compareIds.has(app.id)}
                onChange={() => onToggleCompare(app.id)}
                disabled={!compareIds.has(app.id) && compareIds.size >= 3}
                style={{ accentColor: CAREER_BLUE, width: 16, height: 16 }}
              />
              {getCompareLabel(compareIds, app.id)}
            </label>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              type="button"
              className="wm-outlineBtn"
              data-testid={`career-applicant-quick-view-${app.id}`}
              onClick={() => setQuickApp(app)}
              style={{ minHeight: 32, fontSize: 11, fontWeight: 800 }}
            >
              Quick view
            </button>
          </div>

          <CareerCandidateCard
            app={app}
            post={post}
            tab={tab}
            isBusy={isBusy}
            isBackupSuggestion={
              (tab === "applied" || tab === "backup") && backupSuggestionIds.has(app.id)
            }
            onShortlist={onShortlist}
            onRemoveFromShortlist={onRemoveFromShortlist}
            onReject={onReject}
            onScheduleInterview={onScheduleInterview}
            onRecordResult={onRecordResult}
            onSendOffer={onSendOffer}
            onHire={onHire}
            onEditNotes={onEditNotes}
          />
        </div>
      ))}

      {hasMore ? (
        <button
          type="button"
          className="wm-outlineBtn wm-press-card"
          data-testid="career-candidate-show-more"
          aria-label={`Show more candidates, ${apps.length - visibleLimit} remaining`}
          onClick={() => setVisibleLimit((limit) => limit + CANDIDATE_SHOW_LIMIT)}
          style={{ minHeight: 44, fontWeight: 800 }}
        >
          Show more ({apps.length - visibleLimit} remaining)
        </button>
      ) : null}

      <SlideOver
        open={Boolean(quickApp)}
        onClose={() => setQuickApp(null)}
        title={quickApp ? getCandidateWorkerName(quickApp) : "Applicant"}
        subtitle={post.jobTitle}
        testId="career-applicant-slideover"
        footer={
          <button type="button" className="wm-outlineBtn" onClick={() => setQuickApp(null)}>
            Close
          </button>
        }
      >
        {quickApp ? <CareerApplicantQuickView app={quickApp} post={post} /> : null}
      </SlideOver>
    </section>
  );
}
