// App name: Job Mitra
// CareerPostCandidateList helpers + empty state
/* eslint-disable react-refresh/only-export-components -- helpers + empty state colocated for pipeline UI */

import { useNavigate } from "react-router-dom";
import { EnterpriseEmpty, StatusBadge } from "../../../../shared/components/enterprise";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import { getScreeningPills } from "../helpers/careerCandidateCard.helpers";
import type { CareerTab } from "./CareerPipelineTabs";

export const CANDIDATE_SHOW_LIMIT = 25;

export function EmptyCandidateState({ tab, post }: { tab: CareerTab; post: CareerJobPost }) {
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

export function getTabSectionLabel(tab: CareerTab): string {
  if (tab === "applied") return "Applied candidates";
  if (tab === "backup") return "Backup candidates";
  if (tab === "shortlisted") return "Shortlisted candidates";
  if (tab === "interview") return "Interview candidates";
  if (tab === "offered") return "Offer candidates";
  if (tab === "hired") return "Hired candidates";
  return "Rejected candidates";
}

export function getEmptyStateCopy(
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

export function getCompareLabel(compareIds: Set<string>, appId: string): string {
  if (compareIds.has(appId)) return "Selected for compare";
  if (compareIds.size >= 3) return "Max 3 selected";
  return "Select for compare";
}

export function isCompareAllowed(tab: CareerTab): boolean {
  return tab === "shortlisted" || tab === "interview" || tab === "offered";
}

export function CareerApplicantQuickView({
  app,
  post,
}: {
  app: CareerApplication;
  post: CareerJobPost;
}) {
  const screeningPills = getScreeningPills(app, post);
  const questions = post.screeningQuestions ?? [];

  return (
    <div style={{ display: "grid", gap: 10 }} data-testid="career-applicant-slideover-body">
      <StatusBadge label={String(app.stage)} tone="pending" accent="career" />
      <div style={{ fontSize: 13 }}>
        Notice: {app.noticePeriod || "Not specified"} · Expected salary:{" "}
        {app.expectedSalary > 0 ? app.expectedSalary.toLocaleString() : "Not specified"}
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {app.coverNote?.trim() || "No cover note provided."}
      </div>
      <div data-testid="career-applicant-slideover-screening">
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Screening answers</div>
        {questions.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
            No screening questions on this post.
          </div>
        ) : screeningPills.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
            Candidate has not answered screening questions yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {screeningPills.map((pill) => (
              <div
                key={pill.id}
                style={{
                  fontSize: 12,
                  lineHeight: 1.4,
                  padding: "8px 10px",
                  borderRadius: "var(--wm-radius-chip)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  background: "rgba(255,255,255,0.9)",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--wm-career-text)" }}>{pill.label}</div>
                <div style={{ marginTop: 4, fontWeight: 800, color: "var(--wm-career-accent)" }}>
                  {pill.answer === "yes" ? "Yes" : "No"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
