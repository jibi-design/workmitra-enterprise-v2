// App name: Job Mitra
// File name: CareerPostCandidateList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostCandidateList.tsx

import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import { CareerCandidateCard } from "./CareerCandidateCard";
import { CareerCompareToolbar } from "./CareerCompareToolbar";
import type { CareerTab } from "./CareerPipelineTabs";

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

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

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

  return (
    <section style={{ marginTop: 16, display: "grid", gap: 16 }}>
      {apps.length === 0 && <EmptyCandidateState tab={tab} post={post} />}

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
    </section>
  );
}

function EmptyCandidateState({ tab, post }: { tab: CareerTab; post: CareerJobPost }) {
  const copy = getEmptyStateCopy(tab, post);

  return (
    <div
      style={{
        padding: 32,
        borderRadius: 28,
        border: "1px dashed rgba(37,99,235,0.3)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.5))",
        boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05)",
        backdropFilter: "blur(12px)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          margin: "0 auto",
          borderRadius: 20,
          background: "rgba(37,99,235,0.1)",
          border: "1px solid rgba(37,99,235,0.15)",
          color: CAREER_BLUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 1.57-6 3.5V20h12v-2.5c0-1.93-2.69-3.5-6-3.5Z"
          />
        </svg>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 18,
          fontWeight: 900,
          color: CAREER_TEXT,
          lineHeight: 1.2,
        }}
      >
        {copy.title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 700,
          color: CAREER_MUTED,
          lineHeight: 1.5,
          maxWidth: 400,
          margin: "8px auto 0",
        }}
      >
        {copy.body}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          borderRadius: 16,
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.1)",
          color: CAREER_BLUE_DEEP,
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.5,
          display: "inline-block",
        }}
      >
        {copy.helper}
      </div>
    </div>
  );
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
