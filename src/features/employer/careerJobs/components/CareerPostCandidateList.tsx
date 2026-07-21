// App name: Job Mitra
// File name: CareerPostCandidateList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostCandidateList.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import { EnterpriseEmpty, SlideOver, StatusBadge } from "../../../../shared/components/enterprise";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import { CareerCandidateCard } from "./CareerCandidateCard";
import { CareerCompareToolbar } from "./CareerCompareToolbar";
import type { CareerTab } from "./CareerPipelineTabs";
import { getCandidateWorkerName } from "../helpers/careerCandidateCard.helpers";

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
          <span className="wm-career-pill wm-career-pill--pay">{apps.length}</span>
        </div>
      )}

      {showCompareToolbar && (
        <CareerCompareToolbar
          compareMode={compareMode}
          selectedCount={compareIds.size}
          onStartCompare={onStartCompare}
          onCancelCompare={onCancelCompare}
          onOpenCompare={onOpenCompare}
        />
      )}

      {apps.map((app) => (
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
                borderRadius: 16,
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
        {quickApp ? (
          <div style={{ display: "grid", gap: 10 }} data-testid="career-applicant-slideover-body">
            <StatusBadge label={String(quickApp.stage)} tone="pending" accent="career" />
            <div style={{ fontSize: 13 }}>
              Notice: {quickApp.noticePeriod || "Not specified"} · Expected salary:{" "}
              {quickApp.expectedSalary > 0
                ? quickApp.expectedSalary.toLocaleString()
                : "Not specified"}
            </div>
            <div style={{ fontSize: 12, color: CAREER_MUTED, lineHeight: 1.5 }}>
              {quickApp.coverNote?.trim() || "No cover note provided."}
            </div>
          </div>
        ) : null}
      </SlideOver>
    </section>
  );
}

function EmptyCandidateState({ tab, post }: { tab: CareerTab; post: CareerJobPost }) {
  const copy = getEmptyStateCopy(tab, post);
  const nav = useNavigate();

  return (
    <EnterpriseEmpty
      domain="career"
      title={copy.title}
      subtitle={`${copy.body} ${copy.helper}`}
      primaryLabel={tab === "applied" ? "Back to Career posts" : "Review Applied tab"}
      onPrimary={() => {
        if (tab === "applied") {
          nav(ROUTE_PATHS.employerCareerPosts);
          return;
        }
        nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", post.id));
      }}
      testId={`career-candidates-empty-${tab}`}
    />
  );
}

function getTabSectionLabel(tab: CareerTab): string {
  if (tab === "applied") return "Applied candidates";
  if (tab === "backup") return "Backup candidates";
  if (tab === "shortlisted") return "Shortlisted candidates";
  if (tab === "interview") return "Interview candidates";
  if (tab === "offered") return "Offer candidates";
  if (tab === "hired") return "Hired candidates";
  return "Rejected candidates";
}

function getEmptyStateCopy(
  tab: CareerTab,
  post: CareerJobPost,
): { title: string; body: string; helper: string } {
  if (tab === "applied")
    return {
      title: post.status === "active" ? "No applicants yet" : "No applicants in this post",
      body:
        post.status === "active"
          ? "This Career Job is live. Candidate applications will appear here after employees submit their profile and answers."
          : "This post is not currently active, so new applications may not arrive until it is resumed or reposted.",
      helper:
        "When a candidate applies, review their profile, cover note, expected salary, notice period, and screening answers here.",
    };
  if (tab === "backup")
    return {
      title: "No backup candidates",
      body: "Backup candidates will appear here after local analysis suggests reserve candidates for this post.",
      helper: "Backup candidates remain in Applied and can be manually shortlisted later.",
    };
  if (tab === "shortlisted")
    return {
      title: "No shortlisted candidates yet",
      body: "Shortlisted candidates will appear here after you review applicants and move suitable people forward.",
      helper:
        "Use the Applied tab first, then shortlist candidates who match the role requirements.",
    };
  if (tab === "interview")
    return {
      title: "No candidates in interview yet",
      body: "Interview candidates will appear here after shortlisted candidates are scheduled for interview rounds.",
      helper: "After scheduling, record interview results to keep the hiring pipeline accurate.",
    };
  if (tab === "offered")
    return {
      title: "No offers sent yet",
      body: "Candidates with sent offers will appear here before you mark them as hired.",
      helper:
        "Send offers only after interview review is complete and the hiring decision is ready.",
    };
  if (tab === "hired")
    return {
      title: "No hired candidates yet",
      body: "Hired candidates will appear here after you complete the offer and hiring decision.",
      helper: "After hiring, the Career workspace can support onboarding and long-term follow-up.",
    };
  return {
    title: "No rejected candidates",
    body: "Rejected candidates will appear here after you reject an application or pipeline candidate.",
    helper: "Keep rejection reasons professional and clear for internal tracking.",
  };
}

function getCompareLabel(compareIds: Set<string>, appId: string): string {
  if (compareIds.has(appId)) return "Selected for compare";
  if (compareIds.size >= 3) return "Max 3 selected";
  return "Select for compare";
}

function isCompareAllowed(tab: CareerTab): boolean {
  return tab === "shortlisted" || tab === "interview" || tab === "offered";
}
