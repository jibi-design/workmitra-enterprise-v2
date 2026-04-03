// src/features/employee/shiftJobs/pages/ShiftPostDetailsApplyPage.tsx
//
// Shift Post Details + Apply. Sections extracted for 200-line compliance.

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { trackShiftView } from "../helpers/shiftSearchHelpers";
import {
  POSTS_KEY, APPS_KEY, safeParsePosts, safeParseApps, safeWriteApps,
  ensureRequirements, newId, cap,
} from "../helpers/shiftApplyHelpers";
import type { AnswerState } from "../helpers/shiftApplyHelpers";
import { hasConfirmedOverlap } from "../helpers/shiftPostDetailHelpers";
import { ShiftIcon } from "../components/ShiftPostDetailSections";
import { ShiftApplyJobCard } from "../components/ShiftApplyJobCard";
import { ShiftApplyRequirements } from "../components/ShiftApplyRequirements";
import { ShiftApplyQuickQuestions } from "../components/ShiftApplyQuickQuestions";
import {
  CompanyInfoSection, WhatWeProvideSection, JobTypeBadge,
  DressCodeSection, AlreadyAppliedSection, ShiftToast,
} from "../components/ShiftPostDetailSections";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";

export function ShiftPostDetailsApplyPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();
  useEffect(() => { if (postId) trackShiftView(postId); }, [postId]);

  const post = useMemo(() => safeParsePosts(localStorage.getItem(POSTS_KEY)).find((p) => p.id === postId) ?? null, [postId]);
  const req = useMemo(() => (post ? ensureRequirements(post) : { mustHave: [], goodToHave: [] }), [post]);

  const [mustAns, setMustAns] = useState<Record<string, AnswerState>>({});
  const [goodAns, setGoodAns] = useState<Record<string, AnswerState>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [quickAnswers, setQuickAnswers] = useState<Record<string, "yes" | "no">>({});
  const [withdrawConfirm, setWithdrawConfirm] = useState<ConfirmData | null>(null);
  const [doubleBookingPending, setDoubleBookingPending] = useState(false);
  const [toast, setToast] = useState("");

  const mustTotal = req.mustHave.length;
  const mustMetCount = req.mustHave.reduce((acc, item) => acc + (mustAns[item] === "meets" ? 1 : 0), 0);
  const mustGateOk = mustTotal === 0 || mustMetCount === mustTotal;
  const quickQuestions = post?.quickQuestions ?? [];
  const allQuestionsAnswered = quickQuestions.length === 0 || quickQuestions.every((q) => quickAnswers[q.id] !== undefined);

  const existingApp = useMemo(() => {
    if (!post) return null;
    return safeParseApps(localStorage.getItem(APPS_KEY)).filter((a) => a.postId === post.id).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  }, [post]);

  const isApplied = existingApp?.status === "applied";
  const isWithdrawn = existingApp?.status === "withdrawn";
  const canSubmit = mustGateOk && allQuestionsAnswered && !isApplied;

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }
  function onAnswer(kind: "must" | "good", item: string, value: AnswerState) {
    if (kind === "must") setMustAns((s) => ({ ...s, [item]: value }));
    else setGoodAns((s) => ({ ...s, [item]: value }));
  }

  function doSubmit(all: ReturnType<typeof safeParseApps>) {
    if (!post) return;
    const profile = employeeProfileStorage.get();
    const app = {
      id: newId("app"), postId: post.id, createdAt: Date.now(), status: "applied" as const,
      profileSnapshot: { uniqueId: profile.uniqueId || undefined, fullName: profile.fullName.trim() || undefined, city: profile.city.trim() || undefined, experience: profile.experience || undefined, skills: profile.skills.length > 0 ? profile.skills : undefined, languages: profile.languages.length > 0 ? profile.languages : undefined },
      mustHaveAnswers: mustAns, goodToHaveAnswers: goodAns, notes,
      quickAnswers: quickQuestions.length > 0 ? quickAnswers : undefined,
    };
    safeWriteApps([app, ...all]);
    showToast("Application submitted!");
    setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
  }

  function submit() {
    if (!post || !canSubmit) return;
    const all = safeParseApps(localStorage.getItem(APPS_KEY));
    if (all.some((a) => a.postId === post.id && a.status === "applied")) { showToast("Already applied!"); return; }
    if (hasConfirmedOverlap(post.id, post.startAt, post.endAt)) {
      setWithdrawConfirm({ title: "You already have a confirmed shift on this date", message: "You can still apply, but make sure you can attend both.", tone: "warn", confirmLabel: "Apply Anyway", cancelLabel: "Cancel" });
      setDoubleBookingPending(true); return;
    }
    doSubmit(all);
  }

  function confirmWithdraw() {
    if (!post || !existingApp || existingApp.status !== "applied") return;
    const all = safeParseApps(localStorage.getItem(APPS_KEY));
    safeWriteApps(all.map((a) => a.id === existingApp.id ? { ...a, status: "withdrawn" as const, withdrawnAt: Date.now() } : a));
    setWithdrawConfirm(null);
    showToast("Application withdrawn.");
    setTimeout(() => nav(ROUTE_PATHS.employeeShiftApplications), 800);
  }

  if (!post) {
    return (
      <div>
        <div className="wm-pageHead">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}><ShiftIcon /></div>
            <div><div className="wm-pageTitle">Shift details</div><div className="wm-pageSub">This shift is no longer available.</div></div>
          </div>
        </div>
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>Shift not found</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted, #64748b)" }}>This shift may have been removed or expired.</div>
          <div style={{ marginTop: 12 }}><button className="wm-primarybtn" type="button" onClick={() => nav(ROUTE_PATHS.employeeShiftSearch)} style={{ background: "var(--wm-er-accent-shift, #16a34a)" }}>Find Shifts</button></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}><ShiftIcon /></div>
          <div><div className="wm-pageTitle">Shift details</div><div className="wm-pageSub">{cap(post.companyName)} &middot; {cap(post.locationName)}</div></div>
        </div>
      </div>
      <ShiftApplyJobCard post={post} isApplied={isApplied} isWithdrawn={isWithdrawn} />
      <CompanyInfoSection companyName={post.companyName} />
      <WhatWeProvideSection items={Array.isArray(post.whatWeProvide) ? post.whatWeProvide : []} />
      <JobTypeBadge jobType={post.jobType} />
      <DressCodeSection dressCode={post.dressCode} />
      {quickQuestions.length > 0 && <ShiftApplyQuickQuestions questions={quickQuestions} answers={quickAnswers} onChange={setQuickAnswers} />}
      {isApplied && <AlreadyAppliedSection onWithdraw={() => setWithdrawConfirm({ title: "Withdraw this application?", message: "Employer may replace you. Use this only if you cannot attend.", tone: "danger", confirmLabel: "Withdraw", cancelLabel: "Cancel" })} />}
      <ShiftApplyRequirements mustHave={req.mustHave} goodToHave={req.goodToHave} mustAns={mustAns} goodAns={goodAns} notes={notes} mustGateOk={mustGateOk} mustMetCount={mustMetCount} mustTotal={mustTotal} onAnswer={onAnswer} onNote={(item, value) => setNotes((s) => ({ ...s, [item]: value }))} />
      {!isApplied && (
        <div style={{ marginTop: 16, paddingBottom: 48 }}>
          {!allQuestionsAnswered && quickQuestions.length > 0 && <div style={{ marginBottom: 8, fontSize: 12, color: "#92400e", fontWeight: 600, textAlign: "center" }}>Please answer all quick questions above to continue.</div>}
          <button type="button" onClick={submit} disabled={!canSubmit} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: canSubmit ? "var(--wm-er-accent-shift, #16a34a)" : "#d1d5db", color: "#fff", fontSize: 14, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed" }}>Submit Application</button>
        </div>
      )}
      <ShiftToast message={toast} />
      <ConfirmModal confirm={withdrawConfirm} onCancel={() => { setWithdrawConfirm(null); setDoubleBookingPending(false); }} onConfirm={() => { if (doubleBookingPending) { setWithdrawConfirm(null); setDoubleBookingPending(false); doSubmit(safeParseApps(localStorage.getItem(APPS_KEY))); } else { confirmWithdraw(); } }} />
    </div>
  );
}