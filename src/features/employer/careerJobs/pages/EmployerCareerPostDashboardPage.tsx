// src/features/employer/careerJobs/pages/EmployerCareerPostDashboardPage.tsx
//
// Per-post candidate pipeline management.
// Career self-contained: Offer modal (role, salary, start date) wired in.

import { useMemo, useState, useSyncExternalStore, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import type { CareerApplication } from "../types/careerTypes";
import type { CareerOfferInput } from "../types/careerTypes";

import {
  getCareerPostsSnapshot, getCareerAppsSnapshot, getCareerActivitySnapshot,
  subscribeCareerDashboard, fmtDateTime,
} from "../helpers/careerDashboardHelpers";

import { pauseCareerPost, resumeCareerPost, closeCareerPost, cloneCareerPost } from "../services/careerPostService";

import {
  shortlistCandidate, rejectCandidate, scheduleInterview,
  recordInterviewResult, sendOffer, hireCandidate, updateEmployerNotes,
} from "../services/careerPipelineService";

import { CareerPipelineTabs } from "../components/CareerPipelineTabs";
import type { CareerTab } from "../components/CareerPipelineTabs";
import { CareerCandidateCard } from "../components/CareerCandidateCard";
import { CareerScheduleModal } from "../components/CareerScheduleModal";
import { CareerResultModal } from "../components/CareerResultModal";
import { CareerRejectModal } from "../components/CareerRejectModal";
import { CareerOfferModal } from "../components/CareerOfferModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { CompareApplicantsModal, type ComparableApplicant } from "../../../../shared/components/CompareApplicantsModal";

/* ------------------------------------------------ */
/* Post Status Badge                                */
/* ------------------------------------------------ */
function PostStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:  { label: "Draft",  color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
    active: { label: "Active", color: "#16a34a", bg: "rgba(22,163,74,0.08)"  },
    paused: { label: "Paused", color: "#d97706", bg: "rgba(217,119,6,0.08)"  },
    closed: { label: "Closed", color: "#dc2626", bg: "rgba(220,38,38,0.08)"  },
    filled: { label: "Filled", color: "#3730a3", bg: "rgba(29,78,216,0.08)"  },
  };
  const s = map[status] ?? map["draft"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
    }}>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerCareerPostDashboardPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();

  const posts      = useSyncExternalStore(subscribeCareerDashboard, getCareerPostsSnapshot, getCareerPostsSnapshot);
  const appsAll    = useSyncExternalStore(subscribeCareerDashboard, getCareerAppsSnapshot, getCareerAppsSnapshot);
  const activityAll = useSyncExternalStore(subscribeCareerDashboard, getCareerActivitySnapshot, getCareerActivitySnapshot);

  const post     = useMemo(() => posts.find((p) => p.id === postId) ?? null, [posts, postId]);
  const apps     = useMemo(() => appsAll.filter((a) => a.jobId === postId), [appsAll, postId]);
  const activity = useMemo(() => activityAll.filter((a) => a.postId === postId).slice(0, 20), [activityAll, postId]);

  /* ---- UI State ---- */
  const [tab, setTab]             = useState<CareerTab>("applied");
  const [isBusy, setIsBusy]       = useState(false);
  const [showLog, setShowLog]     = useState(false);
  const [notice, setNotice]       = useState<NoticeData | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmFn, setConfirmFn] = useState<(() => void) | null>(null);

  /* ---- Modal State ---- */
  const [scheduleTarget, setScheduleTarget] = useState<{
    appId: string; roundNumber: number; roundLabel: string;
  } | null>(null);

  const [resultTarget, setResultTarget] = useState<{
    appId: string; roundNumber: number; roundLabel: string; candidateName: string;
  } | null>(null);

  const [rejectTarget, setRejectTarget] = useState<{
    appId: string; candidateName: string; currentStage: CareerApplication["stage"];
  } | null>(null);

  const [offerTarget, setOfferTarget]   = useState<{ appId: string } | null>(null);
  const [notesTarget, setNotesTarget]   = useState<{ appId: string; currentNotes: string } | null>(null);
  const [notesValue, setNotesValue]     = useState("");
  const [compareIds, setCompareIds]     = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen]   = useState(false);

  function toggleCompare(appId: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else if (next.size < 3) next.add(appId);
      return next;
    });
  }

  /* ---- Tab filters ---- */
  const appliedApps     = useMemo(() => apps.filter((a) => a.stage === "applied"),    [apps]);
  const shortlistedApps = useMemo(() => apps.filter((a) => a.stage === "shortlisted"),[apps]);
  const interviewApps   = useMemo(() => apps.filter((a) => a.stage === "interview"),  [apps]);
  const offeredApps     = useMemo(() => apps.filter((a) => a.stage === "offered"),    [apps]);
  const hiredApps       = useMemo(() => apps.filter((a) => a.stage === "hired"),      [apps]);
  const rejectedApps    = useMemo(() => apps.filter((a) => a.stage === "rejected" || a.stage === "withdrawn"), [apps]);

  const tabCounts: Record<CareerTab, number> = {
    applied: appliedApps.length, shortlisted: shortlistedApps.length,
    interview: interviewApps.length, offered: offeredApps.length,
    hired: hiredApps.length, rejected: rejectedApps.length,
  };
  const tabApps: Record<CareerTab, CareerApplication[]> = {
    applied: appliedApps, shortlisted: shortlistedApps,
    interview: interviewApps, offered: offeredApps,
    hired: hiredApps, rejected: rejectedApps,
  };

  /* ---- Helpers ---- */
  const busy = useCallback((fn: () => void) => {
    setIsBusy(true);
    try { fn(); } finally { window.setTimeout(() => setIsBusy(false), 350); }
  }, []);

  function openConfirm(data: ConfirmData, fn: () => void) {
    setConfirmData(data);
    setConfirmFn(() => fn);
  }
  function closeConfirm() { setConfirmData(null); setConfirmFn(null); }

  /* ---- Post Lifecycle ---- */
  function handlePause() {
    openConfirm(
      { title: "Pause this post?", message: "The post will no longer be visible to applicants.", tone: "warn", confirmLabel: "Pause" },
      () => pauseCareerPost(postId),
    );
  }
  function handleResume() { resumeCareerPost(postId); }
   function handleRepost() {
    openConfirm(
      {
        title: "Repost this job?",
        message: "A new copy of this post will be created as a draft. You can edit it before publishing.",
        tone: "neutral",
        confirmLabel: "Repost",
        cancelLabel: "Cancel",
      },
      () => {
        const newId = cloneCareerPost(postId);
        if (newId) nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", newId));
        else setNotice({ title: "Error", message: "Could not repost. Please try again." });
      },
    );
  }

  function handleClose() {
    openConfirm(
      { title: "Close this post?", message: "No new applications accepted. Existing candidates can still be processed.", tone: "danger", confirmLabel: "Close Post" },
      () => closeCareerPost(postId),
    );
  }

  /* ---- Pipeline Actions ---- */
  function handleShortlist(appId: string) {
    busy(() => {
      const ok = shortlistCandidate(postId, appId);
      if (ok) setTab("shortlisted");
      else setNotice({ title: "Cannot shortlist", message: "This candidate cannot be shortlisted from their current stage." });
    });
  }

  function handleRejectOpen(appId: string) {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    setRejectTarget({ appId, candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}`, currentStage: app.stage });
  }

  function handleRejectSubmit(reason: string) {
    if (!rejectTarget) return;
    busy(() => {
      const ok = rejectCandidate(postId, rejectTarget.appId, reason);
      if (ok) setTab("rejected");
      else setNotice({ title: "Cannot reject", message: "This candidate cannot be rejected from their current stage." });
    });
    setRejectTarget(null);
  }

  function handleScheduleOpen(appId: string, roundNumber: number) {
    if (!post) return;
    const rc = post.roundConfigs.find((r) => r.round === roundNumber);
    setScheduleTarget({ appId, roundNumber, roundLabel: rc?.label ?? `Round ${roundNumber}` });
  }

  function handleScheduleSubmit(data: Parameters<typeof scheduleInterview>[3]) {
    if (!scheduleTarget) return;
    busy(() => {
      const ok = scheduleInterview(postId, scheduleTarget.appId, scheduleTarget.roundNumber, data);
      if (ok) setTab("interview");
      else setNotice({ title: "Cannot schedule", message: "Interview could not be scheduled." });
    });
    setScheduleTarget(null);
  }

  function handleResultOpen(appId: string, roundNumber: number) {
    if (!post) return;
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    const rc = post.roundConfigs.find((r) => r.round === roundNumber);
    setResultTarget({ appId, roundNumber, roundLabel: rc?.label ?? `Round ${roundNumber}`, candidateName: app.employeeName || `Candidate ${appId.slice(-6).toUpperCase()}` });
  }

  function handleResultSubmit(result: "passed" | "failed", feedback: string) {
    if (!resultTarget) return;
    busy(() => {
      const ok = recordInterviewResult(postId, resultTarget.appId, resultTarget.roundNumber, result, feedback);
      if (!ok) setNotice({ title: "Cannot record result", message: "Interview result could not be saved." });
    });
    setResultTarget(null);
  }

  /* FIX: Open offer modal — collect details before sending */
  function handleSendOfferOpen(appId: string) {
    setOfferTarget({ appId });
  }

  function handleOfferSubmit(offerDetails: CareerOfferInput) {
    if (!offerTarget) return;
    busy(() => {
      const ok = sendOffer(postId, offerTarget.appId, offerDetails);
      if (ok) {
        setTab("offered");
        setNotice({ title: "Offer Sent!", message: `Offer sent to the candidate. They will be notified to accept or decline.`, tone: "success" });
      } else {
        setNotice({ title: "Cannot send offer", message: "The candidate may not have passed all interview rounds." });
      }
    });
    setOfferTarget(null);
  }

  function handleHire(appId: string) {
    openConfirm(
      { title: "Hire this candidate?", message: "The candidate will be hired and a workspace will be created. The post will be marked as Filled.", tone: "neutral", confirmLabel: "Hire" },
      () => busy(() => {
        const wsId = hireCandidate(postId, appId);
        if (wsId) {
          setTab("hired");
          setNotice({ title: "Candidate Hired!", message: "Workspace created. Post marked as Filled.", tone: "success" });
        } else {
          setNotice({ title: "Cannot hire", message: "The candidate may not be in Offered stage." });
        }
      }),
    );
  }

  function handleNotesOpen(appId: string) {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    setNotesTarget({ appId, currentNotes: app.employerNotes });
    setNotesValue(app.employerNotes);
  }

  function handleNotesSave() {
    if (!notesTarget) return;
    updateEmployerNotes(postId, notesTarget.appId, notesValue.trim());
    setNotesTarget(null);
    setNotesValue("");
  }

  /* ---- Not Found ---- */
  if (!post) {
    return (
      <div>
        <div className="wm-pageHead">
          <div className="wm-pageTitle">Post Dashboard</div>
        </div>
        <div className="wm-er-card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Post not found.</div>
          <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employerCareerHome)} style={{ marginTop: 10, fontSize: 12 }}>
            Back to Career Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Modals */}
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <ConfirmModal confirm={confirmData} onConfirm={() => { confirmFn?.(); closeConfirm(); }} onCancel={closeConfirm} />

      <CareerScheduleModal
        open={scheduleTarget !== null}
        roundLabel={scheduleTarget?.roundLabel ?? ""}
        onClose={() => setScheduleTarget(null)}
        onSubmit={handleScheduleSubmit}
      />
      <CareerResultModal
        open={resultTarget !== null}
        roundLabel={resultTarget?.roundLabel ?? ""}
        candidateName={resultTarget?.candidateName ?? ""}
        onClose={() => setResultTarget(null)}
        onSubmit={handleResultSubmit}
      />
      <CareerRejectModal
        open={rejectTarget !== null}
        candidateName={rejectTarget?.candidateName ?? ""}
        currentStage={rejectTarget?.currentStage ?? "applied"}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
      />

      {/* Offer Modal — NEW */}
      <CareerOfferModal
        open={offerTarget !== null}
        jobTitle={post.jobTitle}
        onClose={() => setOfferTarget(null)}
        onSubmit={handleOfferSubmit}
      />

      {/* Notes Modal */}
      <CenterModal open={notesTarget !== null} onBackdropClose={() => { setNotesTarget(null); setNotesValue(""); }} ariaLabel="Employer Notes">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 12 }}>
            Employer Notes
          </div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add private notes about this candidate..."
            rows={4}
            style={{
              width: "100%", fontSize: 13, fontWeight: 500, padding: "10px 12px",
              borderRadius: 10, border: "1.5px solid var(--wm-er-border)",
              background: "var(--wm-er-bg)", color: "var(--wm-er-text)",
              resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => { setNotesTarget(null); setNotesValue(""); }} style={{ fontSize: 13, height: 38, padding: "0 16px" }}>
              Cancel
            </button>
            <button className="wm-primarybtn" type="button" onClick={handleNotesSave} style={{ fontSize: 13, padding: "8px 20px" }}>
              Save
            </button>
          </div>
        </div>
      </CenterModal>

      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="wm-pageTitle">{post.jobTitle.toUpperCase()}</div>
            <PostStatusBadge status={post.status} />
          </div>
          <div className="wm-pageSub">
            {post.companyName}{post.department ? ` \u2014 ${post.department}` : ""} | {post.location} | {post.jobType} / {post.workMode}
          </div>
        </div>
        <button className="wm-outlineBtn" type="button" style={{ fontSize: 11 }} onClick={() => nav(ROUTE_PATHS.employerCareerHome)}>
          All Posts
        </button>
      </div>

      {/* Post Controls */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {post.status === "active" && (
          <button className="wm-outlineBtn" type="button" onClick={handlePause} style={{ fontSize: 12, height: 34, padding: "0 14px" }}>Pause Post</button>
        )}
        {post.status === "paused" && (
          <button className="wm-primarybtn" type="button" onClick={handleResume} style={{ fontSize: 12, padding: "7px 14px" }}>Resume Post</button>
        )}
        {post.status !== "closed" && post.status !== "filled" && (
          <button className="wm-outlineBtn" type="button" onClick={handleClose} style={{ fontSize: 12, height: 34, padding: "0 14px", color: "var(--wm-error, #dc2626)" }}>Close Post</button>
        )}
        {(post.status === "closed" || post.status === "filled") && (
          <button className="wm-outlineBtn" type="button" onClick={handleRepost}
            style={{ fontSize: 12, height: 34, padding: "0 14px", color: "var(--wm-er-accent-career, #1d4ed8)" }}>
            &#8635; Repost Job
          </button>
        )}
      </div>

      {/* Pipeline Overview */}
      <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 14, background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>Pipeline Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8 }}>
          {([
            { label: "Applied",     count: post.totalApplications, color: "var(--wm-er-muted)" },
            { label: "Shortlisted", count: post.shortlisted,       color: "#0284c7" },
            { label: "Interview",   count: post.inInterview,       color: "#d97706" },
            { label: "Offered",     count: post.offered,           color: "#7c3aed" },
            { label: "Hired",       count: post.hired,             color: "#16a34a" },
            { label: "Rejected",    count: post.rejected,          color: "#dc2626" },
          ] as const).map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.count === 0 ? "var(--wm-er-muted)" : s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--wm-er-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>Interview rounds: <b style={{ color: "var(--wm-er-text)" }}>{post.interviewRounds}</b></span>
          {post.closingDate > 0 && <span>Closing: <b style={{ color: "var(--wm-er-text)" }}>{fmtDateTime(post.closingDate)}</b></span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 14 }}>
        <CareerPipelineTabs activeTab={tab} counts={tabCounts} onTabChange={setTab} />
      </div>

      {/* Candidate Cards */}
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {tabApps[tab].length === 0 && (
          <div className="wm-er-card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No candidates here.</div>
          </div>
        )}
        {compareIds.size >= 2 && (
          <button type="button" onClick={() => setCompareOpen(true)} style={{
            position: "sticky", top: 8, zIndex: 10, width: "100%", padding: "10px 16px", borderRadius: 10,
            border: "none", background: "var(--wm-er-accent-career, #1d4ed8)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Compare {compareIds.size} candidates
          </button>
        )}
        {tabApps[tab].map((app) => (
          <div key={app.id}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)" }}>
              <input type="checkbox" checked={compareIds.has(app.id)} onChange={() => toggleCompare(app.id)} disabled={!compareIds.has(app.id) && compareIds.size >= 3} />
              {compareIds.has(app.id) ? "Selected for compare" : compareIds.size >= 3 ? "Max 3 selected" : "Compare"}
            </label>
            <CareerCandidateCard
              app={app}
              post={post}
              tab={tab}
              isBusy={isBusy}
              onShortlist={handleShortlist}
              onReject={handleRejectOpen}
              onScheduleInterview={handleScheduleOpen}
              onRecordResult={handleResultOpen}
              onSendOffer={handleSendOfferOpen}
              onHire={handleHire}
              onEditNotes={handleNotesOpen}
            />
          </div>
        ))}
        <CompareApplicantsModal
          isOpen={compareOpen}
          applicants={apps.filter((a) => compareIds.has(a.id)).map((a): ComparableApplicant => ({
            id: a.id, name: a.employeeName || "Candidate", wmId: a.employeeId ?? "",
            appliedAt: a.appliedAt, status: a.stage,
            skills: a.profileSnapshot?.skills ?? [], experience: a.profileSnapshot?.experience,
            requiredSkills: post.skills ?? [],
          }))}
          onClose={() => setCompareOpen(false)}
        />
      </div>

      {/* Activity Log */}
      <div style={{ marginTop: 16, marginBottom: 24, borderRadius: 14, border: "1px solid var(--wm-er-border)", overflow: "hidden" }}>
        <button type="button" onClick={() => setShowLog((v) => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "var(--wm-er-surface)", border: "none",
          cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)",
        }}>
          <span>Activity Log</span>
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{showLog ? "Hide" : `${activity.length} entries`}</span>
        </button>
        {showLog && (
          <div style={{ padding: "0 16px 16px", background: "var(--wm-er-surface)" }}>
            {activity.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", paddingTop: 8 }}>No activity yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 8, paddingTop: 8 }}>
                {activity.map((a) => (
                  <div key={a.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}>{fmtDateTime(a.createdAt)}</div>
                    </div>
                    {a.body && <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>{a.body}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}