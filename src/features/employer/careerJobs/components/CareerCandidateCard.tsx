// src/features/employer/careerJobs/components/CareerCandidateCard.tsx
//
// Per-candidate card for career pipeline.
// Shows profile snapshot, screening answers, interview progress, employer notes.
// Stage-specific action buttons.
// Career self-contained: no HR Management dependency.

import { useState } from "react";
import type { CareerApplication, CareerJobPost } from "../types/careerTypes";
import type { CareerTab } from "./CareerPipelineTabs";
import { fmtDateTime } from "../helpers/careerDashboardHelpers";
import { DocAccessModal } from "../../../../shared/docAccess/DocAccessModal";
import { CareerCandidateEmploymentActions } from "./CareerCandidateEmploymentActions";

type Props = {
  app: CareerApplication;
  post: CareerJobPost;
  tab: CareerTab;
  isBusy: boolean;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onScheduleInterview: (appId: string, roundNumber: number) => void;
  onRecordResult: (appId: string, roundNumber: number) => void;
  onSendOffer: (appId: string) => void;
  onHire: (appId: string) => void;
  onEditNotes: (appId: string) => void;
};

function StageBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      background: `${color}12`, color, border: `1px solid ${color}33`,
    }}>{label}</span>
  );
}

function ActionBtn({
  label, onClick, disabled, variant = "outline", danger = false,
}: {
  label: string; onClick: () => void;
  disabled?: boolean; variant?: "primary" | "outline"; danger?: boolean;
}) {
  return (
    <button
      className={variant === "primary" ? "wm-primarybtn" : "wm-outlineBtn"}
      type="button" onClick={onClick} disabled={disabled}
      style={{
        fontSize: 12, height: 32,
        padding: variant === "primary" ? "0 14px" : "0 12px",
        color: danger ? "var(--wm-error, #dc2626)" : undefined,
        opacity: disabled ? 0.5 : 1,
      }}
    >{label}</button>
  );
}

function ScreeningPill({ label, answer }: { label: string; answer: "yes" | "no" }) {
  const isYes = answer === "yes";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
      background: isYes ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
      color: isYes ? "var(--wm-er-accent-career, #1d4ed8)" : "#dc2626",
      border: `1px solid ${isYes ? "rgba(29,78,216,0.2)" : "rgba(220,38,38,0.2)"}`,
    }}>
      <span style={{ fontSize: 9 }}>{isYes ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

function InterviewProgress({ app, totalRounds }: { app: CareerApplication; totalRounds: number }) {
  if (totalRounds === 0) return null;
  const passedCount    = app.roundResults.filter((r) => r.status === "passed").length;
  const failedCount    = app.roundResults.filter((r) => r.status === "failed").length;
  const scheduledCount = app.roundResults.filter((r) => r.status === "scheduled").length;
  return (
    <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "var(--wm-er-career-wash)", border: "1px solid rgba(29,78,216,0.12)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 6 }}>
        Interview Progress: {passedCount}/{totalRounds} rounds passed
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: totalRounds }, (_, i) => {
          const round = i + 1;
          const result = app.roundResults.find((r) => r.round === round);
          let bg = "var(--wm-er-divider)";
          if (result?.status === "passed")    bg = "#16a34a";
          if (result?.status === "failed")    bg = "var(--wm-error, #dc2626)";
          if (result?.status === "scheduled") bg = "#d97706";
          return <div key={round} style={{ flex: 1, height: 6, borderRadius: 999, background: bg, transition: "background 0.2s" }} />;
        })}
      </div>
      <div style={{ marginTop: 4, display: "flex", gap: 10, fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 600 }}>
        {passedCount    > 0 && <span style={{ color: "#16a34a" }}>Passed: {passedCount}</span>}
        {scheduledCount > 0 && <span style={{ color: "#d97706" }}>Scheduled: {scheduledCount}</span>}
        {failedCount    > 0 && <span style={{ color: "var(--wm-error, #dc2626)" }}>Failed: {failedCount}</span>}
      </div>
    </div>
  );
}

function getNextSchedulableRound(app: CareerApplication, totalRounds: number): number | null {
  for (let r = 1; r <= totalRounds; r++) {
    const result = app.roundResults.find((rr) => rr.round === r);
    if (!result) return r;
    if (result.status === "scheduled" || result.status === "failed") return null;
  }
  return null;
}

function getRecordableRound(app: CareerApplication): number | null {
  const s = app.roundResults.find((r) => r.status === "scheduled");
  return s ? s.round : null;
}

function allRoundsPassed(app: CareerApplication, totalRounds: number): boolean {
  if (app.roundResults.length < totalRounds) return false;
  return app.roundResults.filter((r) => r.round >= 1 && r.round <= totalRounds).every((r) => r.status === "passed");
}

export function CareerCandidateCard({
  app, post, tab, isBusy,
  onShortlist, onReject, onScheduleInterview,
  onRecordResult, onSendOffer, onHire, onEditNotes,
}: Props) {
  const [showDocModal, setShowDocModal] = useState(false);

  const title      = app.profileSnapshot?.uniqueId ?? app.employeeName ?? `Candidate ${app.id.slice(-6).toUpperCase()}`;
  const workerName = app.profileSnapshot?.fullName ?? app.employeeName ?? title;
  const workerWmId = app.profileSnapshot?.uniqueId ?? app.id;

  const nextRound       = getNextSchedulableRound(app, post.interviewRounds);
  const recordableRound = getRecordableRound(app);
  const canOffer        = allRoundsPassed(app, post.interviewRounds);

  const screeningPills = (post.screeningQuestions ?? []).flatMap((q) => {
    const answer = app.screeningAnswers?.[q.id];
    if (!answer) return [];
    return [{ id: q.id, label: q.text, answer }] as { id: string; label: string; answer: "yes" | "no" }[];
  });

  return (
    <>
      {showDocModal && (
        <DocAccessModal
          workerName={workerName}
          workerWmId={workerWmId}
          domain="career"
          onClose={() => setShowDocModal(false)}
        />
      )}

      <div className="wm-er-card" style={{ padding: 14 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-accent-career)", fontFamily: "monospace", letterSpacing: 0.5 }}>{title}</span>
            {tab === "hired"    && <StageBadge label="HIRED"      color="#16a34a" />}
            {tab === "offered"  && <StageBadge label="OFFER SENT" color="#d97706" />}
            {tab === "rejected" && <StageBadge label="REJECTED"   color="#dc2626" />}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            {fmtDateTime(app.appliedAt)}
          </div>
        </div>

        {/* Profile snapshot */}
        {app.profileSnapshot &&
          (app.profileSnapshot.fullName || app.profileSnapshot.city ||
            (app.profileSnapshot.skills && app.profileSnapshot.skills.length > 0)) && (
            <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.12)" }}>
              {app.profileSnapshot.fullName && (
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{app.profileSnapshot.fullName}</div>
              )}
              <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "var(--wm-er-muted)" }}>
                {app.profileSnapshot.city       && <span>Location: {app.profileSnapshot.city}</span>}
                {app.profileSnapshot.experience && <span>Exp: {app.profileSnapshot.experience}</span>}
                {app.profileSnapshot.languages?.length ? <span>Languages: {app.profileSnapshot.languages.join(", ")}</span> : null}
              </div>
              {app.profileSnapshot.skills && app.profileSnapshot.skills.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {app.profileSnapshot.skills.slice(0, 6).map((s) => (
                    <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(29,78,216,0.1)", color: "var(--wm-er-accent-career)" }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Screening Answer Pills */}
        {screeningPills.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {screeningPills.map((p) => <ScreeningPill key={p.id} label={p.label} answer={p.answer} />)}
          </div>
        )}

        {/* Application summary */}
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--wm-er-muted)" }}>
          {app.noticePeriod       && <span>Notice: {app.noticePeriod}</span>}
          {app.expectedSalary > 0 && <span>Expected: {app.expectedSalary.toLocaleString()}</span>}
          {app.coverNote          && <span>Cover note attached</span>}
        </div>

        {/* Interview progress */}
        {(tab === "interview" || tab === "offered" || tab === "hired") && (
          <InterviewProgress app={app} totalRounds={post.interviewRounds} />
        )}

        {/* Rejection reason */}
        {tab === "rejected" && app.rejectionReason && (
          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.12)", fontSize: 12, color: "var(--wm-error, #dc2626)" }}>
            Reason: {app.rejectionReason}
          </div>
        )}

        {/* Employer notes preview */}
        {app.employerNotes && (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
            Notes: {app.employerNotes.length > 60 ? `${app.employerNotes.slice(0, 60)}...` : app.employerNotes}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>

          {tab === "applied" && (
            <>
              <ActionBtn label="Shortlist" variant="primary" onClick={() => onShortlist(app.id)} disabled={isBusy} />
              <ActionBtn label="Reject"    onClick={() => onReject(app.id)} disabled={isBusy} danger />
            </>
          )}

          {tab === "shortlisted" && (
            <>
              {/* View Documents — shortlisted only */}
              <button type="button" onClick={() => setShowDocModal(true)}
                style={{
                  fontSize: 11, fontWeight: 600, height: 32, padding: "0 10px",
                  borderRadius: 8, border: "1px solid rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.06)", color: "#7c3aed", cursor: "pointer",
                }}>
                🔐 View Documents
              </button>
              <ActionBtn label="Schedule Interview" variant="primary" onClick={() => onScheduleInterview(app.id, 1)} disabled={isBusy} />
              <ActionBtn label="Reject" onClick={() => onReject(app.id)} disabled={isBusy} danger />
            </>
          )}

          {tab === "interview" && (
            <>
              {recordableRound !== null && (
                <ActionBtn label="Update Interview Result" variant="primary" onClick={() => onRecordResult(app.id, recordableRound)} disabled={isBusy} />
              )}
              {nextRound !== null && recordableRound === null && (
                <ActionBtn label={`Schedule Round ${nextRound}`} variant="primary" onClick={() => onScheduleInterview(app.id, nextRound)} disabled={isBusy} />
              )}
              {canOffer && (
                <ActionBtn label="Send Offer" variant="primary" onClick={() => onSendOffer(app.id)} disabled={isBusy} />
              )}
              <ActionBtn label="Reject" onClick={() => onReject(app.id)} disabled={isBusy} danger />
            </>
          )}

          {tab === "offered" && (
            <>
              <ActionBtn label="Hire"   variant="primary" onClick={() => onHire(app.id)}   disabled={isBusy} />
              <ActionBtn label="Reject" onClick={() => onReject(app.id)} disabled={isBusy} danger />
            </>
          )}

          {tab === "hired" && app.hiredAt && (
            <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Hired on {fmtDateTime(app.hiredAt)}</div>
          )}

          {tab === "rejected" && app.rejectedAt && (
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 600 }}>Rejected on {fmtDateTime(app.rejectedAt)}</div>
          )}

          {tab !== "hired" && tab !== "rejected" && (
            <ActionBtn label="Notes" onClick={() => onEditNotes(app.id)} />
          )}
        </div>

        {/* Employment lifecycle actions (hired tab only) */}
        {tab === "hired" && (
          <CareerCandidateEmploymentActions
            careerPostId={app.jobId}
            employeeName={workerName}
            onNotice={() => {}}
          />
        )}
      </div>
    </>
  );
}