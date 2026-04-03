// src/features/employer/shiftJobs/components/CandidateCard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EmployeeShiftApplication } from "../storage/employerShift.storage";
import type { Tab } from "../helpers/dashboardHelpers";
import { fmtTime } from "../helpers/dashboardHelpers";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DocAccessModal } from "../../../../shared/docAccess/DocAccessModal";

type QuickQuestion = { id: string; text: string };

type Props = {
  app: EmployeeShiftApplication;
  mode: Tab;
  isBusy: boolean;
  quickQuestions?: QuickQuestion[];
  onMoveToShortlist: (appId: string) => void;
  onMoveToWaiting: (appId: string) => void;
  onConfirm: (appId: string) => void;
  onOpenGroup: (appId: string) => void;
  onRemove: (appId: string) => void;
  onReplace: (appId: string) => void;
};

function StatusPill({ text }: { text: string }) {
  return (
    <span style={{
      marginLeft: 8, fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 999,
      border: "1px solid var(--wm-er-border)",
      background: "#f9fafb", color: "var(--wm-er-muted)",
    }}>{text}</span>
  );
}

function AnswerPill({ label, answer }: { label: string; answer: "yes" | "no" }) {
  const isYes = answer === "yes";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
      background: isYes ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
      color: isYes ? "#16a34a" : "#dc2626",
      border: `1px solid ${isYes ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
    }}>
      <span style={{ fontSize: 9 }}>{isYes ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

export function CandidateCard({
  app, mode, isBusy, quickQuestions = [],
  onMoveToShortlist, onMoveToWaiting, onConfirm,
  onOpenGroup, onRemove, onReplace,
}: Props) {
  const a   = app;
  const nav = useNavigate();
  const [showDocModal, setShowDocModal] = useState(false);

  const title      = a.profileSnapshot?.uniqueId ?? `Candidate ${a.id.slice(-6).toUpperCase()}`;
  const isConf     = a.status === "confirmed";
  const workerName = a.profileSnapshot?.fullName ?? title;
  const workerWmId = a.profileSnapshot?.uniqueId ?? a.id;

  const detailPath = ROUTE_PATHS.employerCandidateDetail
    .replace(":postId", a.postId)
    .replace(":appId", a.id);

  const answerPills = quickQuestions.flatMap((q) => {
    const answer = a.quickAnswers?.[q.id];
    if (!answer) return [];
    return [{ id: q.id, label: q.text, answer }] as { id: string; label: string; answer: "yes" | "no" }[];
  });

  return (
    <>
      {showDocModal && (
        <DocAccessModal
          workerName={workerName}
          workerWmId={workerWmId}
          domain="shift"
          onClose={() => setShowDocModal(false)}
        />
      )}

      <div className="wm-er-card" style={{ padding: 14 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button type="button" onClick={() => nav(detailPath)}
              style={{
                fontWeight: 700, fontSize: 13, color: "var(--wm-er-accent-shift)",
                background: "none", border: "none", padding: 0, cursor: "pointer",
                textDecoration: "underline", textUnderlineOffset: 3,
                fontFamily: "monospace", letterSpacing: 0.5,
              }}>
              {title}
            </button>
            {isConf ? <StatusPill text="CONFIRMED" /> : null}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 600 }}>
            {fmtTime(a.createdAt)}
          </div>
        </div>

        {/* Profile snapshot */}
        {a.profileSnapshot &&
          (a.profileSnapshot.fullName || a.profileSnapshot.city || a.profileSnapshot.skills?.length) && (
            <div style={{
              marginTop: 8, padding: "8px 10px", borderRadius: 10,
              background: "rgba(15,118,110,0.04)", border: "1px solid rgba(15,118,110,0.12)",
            }}>
              {a.profileSnapshot.fullName && (
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {a.profileSnapshot.fullName}
                </div>
              )}
              <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "var(--wm-er-muted)" }}>
                {a.profileSnapshot.city       && <span>📍 {a.profileSnapshot.city}</span>}
                {a.profileSnapshot.experience && <span>⭐ {a.profileSnapshot.experience}</span>}
                {a.profileSnapshot.languages && a.profileSnapshot.languages.length > 0 && (
                  <span>🗣 {a.profileSnapshot.languages.join(", ")}</span>
                )}
              </div>
              {a.profileSnapshot.skills && a.profileSnapshot.skills.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.profileSnapshot.skills.slice(0, 5).map((s) => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                      background: "rgba(15,118,110,0.1)", color: "var(--wm-er-accent-shift)",
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Quick Answer Pills */}
        {answerPills.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {answerPills.map((p) => <AnswerPill key={p.id} label={p.label} answer={p.answer} />)}
          </div>
        )}

        {/* Must-have / Good-to-have */}
        {(Object.keys(a.mustHaveAnswers).length > 0 || Object.keys(a.goodToHaveAnswers).length > 0) && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.keys(a.mustHaveAnswers).length > 0 && (
              <span>Must-have: {Object.values(a.mustHaveAnswers).filter((v) => v === "meets").length}/{Object.keys(a.mustHaveAnswers).length} met</span>
            )}
            {Object.keys(a.goodToHaveAnswers).length > 0 && (
              <span>Good-to-have: {Object.values(a.goodToHaveAnswers).filter((v) => v === "meets").length}/{Object.keys(a.goodToHaveAnswers).length} met</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>

          {mode === "applied" && (
            <>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onMoveToShortlist(a.id)} disabled={isBusy}
                style={{ fontSize: 12, height: 32, padding: "0 12px" }}>
                Add to Selected
              </button>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onRemove(a.id)} disabled={isBusy}
                style={{ fontSize: 12, height: 32, padding: "0 12px", color: "var(--wm-error)" }}>
                Reject
              </button>
            </>
          )}

          {mode === "shortlist" && (
            <>
              {/* View Documents — shortlist only */}
              <button type="button" onClick={() => setShowDocModal(true)}
                style={{
                  fontSize: 11, fontWeight: 600, height: 32, padding: "0 10px",
                  borderRadius: 8, border: "1px solid rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.06)", color: "#7c3aed", cursor: "pointer",
                }}>
                🔐 View Documents
              </button>

              {isConf ? (
                <button className="wm-primarybtn" type="button"
                  onClick={() => onOpenGroup(a.id)} style={{ fontSize: 12, padding: "6px 12px" }}>
                  Open Group
                </button>
              ) : (
                <button className="wm-primarybtn" type="button"
                  onClick={() => onConfirm(a.id)} disabled={isBusy}
                  style={{ fontSize: 12, padding: "6px 12px" }}>
                  {isBusy ? "..." : "Confirm"}
                </button>
              )}
              <button className="wm-outlineBtn" type="button"
                onClick={() => onMoveToWaiting(a.id)} disabled={isBusy}
                style={{ fontSize: 12, height: 32, padding: "0 12px" }}>
                To Backup
              </button>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onRemove(a.id)} disabled={isBusy}
                style={{ fontSize: 12, height: 32, padding: "0 12px", color: "var(--wm-error)" }}>
                Remove
              </button>
            </>
          )}

          {mode === "waiting" && (
            <>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onMoveToShortlist(a.id)}
                style={{ fontSize: 12, height: 32, padding: "0 12px" }}>
                Promote
              </button>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onRemove(a.id)}
                style={{ fontSize: 12, height: 32, padding: "0 12px", color: "var(--wm-error)" }}>
                Remove
              </button>
            </>
          )}

          {mode === "confirmed" && (
            <>
              <button className="wm-primarybtn" type="button"
                onClick={() => onOpenGroup(a.id)} style={{ fontSize: 12, padding: "6px 12px" }}>
                Open Group
              </button>
              <button className="wm-outlineBtn" type="button"
                onClick={() => onReplace(a.id)}
                style={{ fontSize: 12, height: 32, padding: "0 12px", color: "var(--wm-error)" }}>
                Replace
              </button>
            </>
          )}

          {mode === "rejected" && (
            <button className="wm-outlineBtn" type="button"
              onClick={() => onMoveToShortlist(a.id)}
              style={{ fontSize: 12, height: 32, padding: "0 12px" }}>
              Reconsider
            </button>
          )}
        </div>
      </div>
    </>
  );
}