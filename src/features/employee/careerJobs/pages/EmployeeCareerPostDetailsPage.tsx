// src/features/employee/careerJobs/pages/EmployeeCareerPostDetailsPage.tsx
//
// Career post details + apply. Sections extracted for 200-line compliance.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import { applyToCareerJob, withdrawCareerApplication, getMyApplicationForJob } from "../services/careerApplyService";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { ShiftApplyQuickQuestions } from "../../shiftJobs/components/ShiftApplyQuickQuestions";
import { NOTICE_OPTIONS, LABEL_STYLE, INPUT_STYLE } from "../helpers/careerPostDetailHelpers";
import {
  JobDetailsCard, CompanyInfoCard, DescriptionCard,
  ResponsibilitiesCard, RequirementsCard, AlreadyAppliedBanner,
} from "../components/CareerPostDetailSections";

export function EmployeeCareerPostDetailsPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();
  const allPosts = useSyncExternalStore(subscribeCareerSearch, getCareerSearchSnapshot, getCareerSearchSnapshot);
  const post = useMemo(() => allPosts.find((p) => p.id === postId) ?? null, [allPosts, postId]);
  const existingApp = useMemo(() => getMyApplicationForJob(postId), [postId]);
  const isApplied = existingApp?.stage !== undefined && existingApp.stage !== "withdrawn";

  const [coverNote, setCoverNote] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("Immediate");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, "yes" | "no">>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  const screeningQuestions = (post as { screeningQuestions?: { id: string; text: string }[] })?.screeningQuestions ?? [];
  const allScreeningAnswered = screeningQuestions.length === 0 || screeningQuestions.every((q) => screeningAnswers[q.id] !== undefined);
  const canSubmit = !isApplied && coverNote.trim().length > 0 && allScreeningAnswered;

  function handleApply() {
    if (!post || !canSubmit) return;
    const result = applyToCareerJob({ jobId: post.id, coverNote: coverNote.trim(), expectedSalary: Number(expectedSalary) || 0, noticePeriod: noticePeriod || "Immediate", screeningAnswers: screeningQuestions.length > 0 ? screeningAnswers : undefined });
    if (result) { setShowSuccess(true); setTimeout(() => { setShowSuccess(false); nav(ROUTE_PATHS.employeeCareerSearch); }, 1200); }
    else { setShowError("You have already applied to this position."); }
  }

  function handleWithdraw() {
    const ok = withdrawCareerApplication(postId);
    setShowWithdrawConfirm(false);
    if (ok) { setShowSuccess(true); setTimeout(() => { setShowSuccess(false); nav(ROUTE_PATHS.employeeCareerSearch); }, 1200); }
    else { setShowError("Could not withdraw. Application may already be processed."); }
  }

  if (!post) {
    return (
      <div>
        <div className="wm-pageHead"><div><div className="wm-pageTitle">Job details</div><div className="wm-pageSub">Post not found.</div></div></div>
        <div className="wm-ee-card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700 }}>This job is no longer available.</div>
          <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)} style={{ marginTop: 10, fontSize: 12 }}>Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Modals */}
      <CenterModal open={showSuccess} ariaLabel="Success">
        <div style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>Done</div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginTop: 4 }}>Redirecting...</div>
        </div>
      </CenterModal>
      <CenterModal open={showError !== null} onBackdropClose={() => setShowError(null)} ariaLabel="Error">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-error)" }}>Cannot apply</div>
          <div style={{ fontSize: 13, color: "var(--wm-emp-muted)", marginTop: 8 }}>{showError}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><button className="wm-outlineBtn" type="button" onClick={() => setShowError(null)}>OK</button></div>
        </div>
      </CenterModal>
      <CenterModal open={showWithdrawConfirm} onBackdropClose={() => setShowWithdrawConfirm(false)} ariaLabel="Withdraw">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-error)" }}>Withdraw application?</div>
          <div style={{ fontSize: 13, color: "var(--wm-emp-muted)", marginTop: 8, lineHeight: 1.6 }}>Your application for <b>{post.jobTitle}</b> at <b>{post.companyName}</b> will be withdrawn.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setShowWithdrawConfirm(false)}>Cancel</button>
            <button className="wm-primarybtn" type="button" onClick={handleWithdraw} style={{ background: "var(--wm-error)" }}>Withdraw</button>
          </div>
        </div>
      </CenterModal>

      {/* Header */}
      <div className="wm-pageHead"><div><div className="wm-pageTitle">{post.jobTitle}</div><div className="wm-pageSub">{post.companyName}{post.department ? ` — ${post.department}` : ""}</div></div></div>

      {/* Display sections */}
      <JobDetailsCard post={post} />
      <CompanyInfoCard />
      <DescriptionCard text={post.description} />
      <ResponsibilitiesCard items={post.responsibilities} />
      <RequirementsCard qualifications={post.qualifications} skills={post.skills} />
      {isApplied && <AlreadyAppliedBanner onWithdraw={() => setShowWithdrawConfirm(true)} />}
      {!isApplied && screeningQuestions.length > 0 && <div style={{ marginTop: 10 }}><ShiftApplyQuickQuestions questions={screeningQuestions} answers={screeningAnswers} onChange={setScreeningAnswers} /></div>}

      {/* Apply form */}
      {!isApplied && (
        <div className="wm-ee-card" style={{ marginTop: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 12 }}>Apply for this position</div>
          <div style={{ marginBottom: 12 }}><label style={LABEL_STYLE}>Cover note *</label><textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder="Why are you a good fit? Brief introduction..." rows={4} style={{ ...INPUT_STYLE, resize: "vertical" }} /></div>
          <div style={{ marginBottom: 12 }}><label style={LABEL_STYLE}>Expected salary (optional)</label><input type="number" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="Enter expected salary" style={INPUT_STYLE} /><div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>No currency symbol. Enter raw number only.</div></div>
          <div style={{ marginBottom: 12 }}>
            <label style={LABEL_STYLE}>Notice period</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {NOTICE_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => setNoticePeriod(opt)} style={{ fontSize: 12, fontWeight: noticePeriod === opt ? 700 : 600, padding: "6px 12px", borderRadius: 999, border: noticePeriod === opt ? "1.5px solid var(--wm-er-accent-career)" : "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))", background: noticePeriod === opt ? "rgba(29,78,216,0.08)" : "var(--wm-emp-bg, #fff)", color: noticePeriod === opt ? "var(--wm-er-accent-career)" : "var(--wm-emp-muted)", cursor: "pointer" }}>{opt}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.10)", fontSize: 11, color: "var(--wm-emp-muted)", lineHeight: 1.6 }}>Your profile information will be automatically included with your application.</div>
        </div>
      )}

      {/* Sticky actions */}
      <div className="wm-stickySaveBar">
        <div className="wm-stickyInner">
          <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}>Back to Search</button>
          {isApplied && <button className="wm-outlineBtn" type="button" onClick={() => setShowWithdrawConfirm(true)} style={{ color: "var(--wm-error)" }}>Withdraw</button>}
          {!isApplied && <button className="wm-primarybtn" type="button" onClick={handleApply} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }} title={!coverNote.trim() ? "Cover note is required" : "Submit your application"}>Submit Application</button>}
        </div>
      </div>
      <div style={{ height: 72 }} />
    </div>
  );
}