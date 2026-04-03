// src/features/employer/shiftJobs/pages/EmployerShiftTemplatesPage.tsx
//
// Shift Templates — saved shift post templates.
// "Use Template" pre-fills the create form via sessionStorage.
// Domain: Shift Green.

import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  shiftTemplatesStorage,
  type ShiftTemplate,
} from "../storage/shiftTemplatesStorage";

/* ------------------------------------------------ */
/* Snapshot                                         */
/* ------------------------------------------------ */
let _raw: string | null = "__init__";
let _cache: ShiftTemplate[] = [];

function getSnapshot(): ShiftTemplate[] {
  const raw = localStorage.getItem("wm_employer_shift_templates_v1");
  if (raw !== _raw) { _raw = raw; _cache = shiftTemplatesStorage.getAll(); }
  return _cache;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerShiftTemplatesPage() {
  const nav       = useNavigate();
  const templates = useSyncExternalStore(shiftTemplatesStorage.subscribe, getSnapshot, getSnapshot);

  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [renameId, setRenameId]     = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const totalCount = templates.length;

  function handleUse(t: ShiftTemplate) {
    shiftTemplatesStorage.setPending({
      jobName:        t.jobName,
      companyName:    t.companyName,
      category:       t.category,
      experience:     t.experience,
      payPerDay:      t.payPerDay,
      locationName:   t.locationName,
      description:    t.description,
      shiftTiming:    t.shiftTiming,
      vacancies:      t.vacancies,
      waitingBuffer:  t.waitingBuffer,
      mustHave:       t.mustHave,
      goodToHave:     t.goodToHave,
      whatWeProvide:  t.whatWeProvide,
      quickQuestions: t.quickQuestions,
      dressCode:      t.dressCode,
    });
    nav(ROUTE_PATHS.employerShiftCreate);
  }

  function handleRenameOpen(t: ShiftTemplate) {
    setRenameId(t.id);
    setRenameValue(t.name);
  }

  function handleRenameSave() {
    if (!renameId || !renameValue.trim()) return;
    shiftTemplatesStorage.rename(renameId, renameValue);
    setRenameId(null);
    setRenameValue("");
  }

  function handleDelete() {
    if (!deleteId) return;
    shiftTemplatesStorage.delete(deleteId);
    setDeleteId(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Shift Templates</div>
          <div className="wm-pageSub">Reuse saved shift post formats</div>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
          background: "rgba(22,163,74,0.08)",
          color: "var(--wm-er-accent-shift, #16a34a)",
          border: "1px solid rgba(22,163,74,0.2)",
        }}>
          {totalCount} saved
        </span>
      </div>

      {/* Hint */}
      <div style={{
        marginTop: 10, padding: "10px 14px", borderRadius: 12,
        background: "rgba(22,163,74,0.04)", border: "1px solid rgba(22,163,74,0.15)",
        fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6,
      }}>
        To save a template, open any shift post in <b style={{ color: "var(--wm-er-text)" }}>My Posts</b> and tap &ldquo;Save as Template&rdquo;.
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="wm-er-card" style={{ marginTop: 14, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>&#128203;</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>No templates yet</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.6, maxWidth: 280, margin: "6px auto 0" }}>
            Save your frequently used shift formats as templates to fill new posts in one tap.
          </div>
          <button className="wm-primarybtn" type="button"
            onClick={() => nav(ROUTE_PATHS.employerShiftPosts)}
            style={{ marginTop: 14 }}>
            Go to My Posts
          </button>
        </div>
      )}

      {/* Templates list */}
      <div style={{ marginTop: 12, display: "grid", gap: 10, marginBottom: 32 }}>
        {templates.map((t) => (
          <div key={t.id} className="wm-er-card" style={{ padding: 14 }}>
            {/* Name row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              {renameId === t.id ? (
                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  <input
                    className="wm-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameSave(); if (e.key === "Escape") setRenameId(null); }}
                    placeholder="Template name"
                    maxLength={60}
                    style={{ flex: 1, fontSize: 13 }}
                    autoFocus
                  />
                  <button type="button" onClick={handleRenameSave}
                    disabled={!renameValue.trim()}
                    style={{ fontSize: 12, fontWeight: 600, padding: "0 12px", height: 38, borderRadius: 8, border: "none", background: "var(--wm-er-accent-shift, #16a34a)", color: "#fff", cursor: "pointer" }}>
                    Save
                  </button>
                  <button type="button" onClick={() => setRenameId(null)}
                    style={{ fontSize: 12, padding: "0 10px", height: 38, borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-shift, #16a34a)" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 2 }}>
                    {t.jobName} &mdash; {t.companyName}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11, color: "var(--wm-er-muted)" }}>
              <span style={{ background: "var(--wm-er-surface)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--wm-er-border)" }}>
                {t.category}
              </span>
              <span style={{ background: "var(--wm-er-surface)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--wm-er-border)" }}>
                {t.vacancies} {t.vacancies === 1 ? "worker" : "workers"}
              </span>
              <span style={{ background: "var(--wm-er-surface)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--wm-er-border)" }}>
                Pay: {t.payPerDay}/day
              </span>
              {t.mustHave.length > 0 && (
                <span style={{ background: "var(--wm-er-surface)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--wm-er-border)" }}>
                  {t.mustHave.length} requirements
                </span>
              )}
              {(t.quickQuestions?.length ?? 0) > 0 && (
                <span style={{ background: "var(--wm-er-surface)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--wm-er-border)" }}>
                  {t.quickQuestions!.length} questions
                </span>
              )}
            </div>

            {/* Delete confirm */}
            {deleteId === t.id && (
              <div style={{
                marginTop: 10, padding: "10px 12px", borderRadius: 10,
                background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}>
                <span style={{ fontSize: 12, color: "var(--wm-error, #dc2626)" }}>Delete this template?</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={handleDelete}
                    style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 8, border: "none", background: "rgba(220,38,38,0.12)", color: "var(--wm-error, #dc2626)", cursor: "pointer" }}>
                    Delete
                  </button>
                  <button type="button" onClick={() => setDeleteId(null)}
                    style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {deleteId !== t.id && renameId !== t.id && (
              <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setDeleteId(t.id)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)", background: "none", color: "var(--wm-error, #dc2626)", cursor: "pointer" }}>
                  Delete
                </button>
                <button type="button" onClick={() => handleRenameOpen(t)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                  Rename
                </button>
                <button type="button" onClick={() => handleUse(t)}
                  style={{ fontSize: 12, fontWeight: 700, padding: "5px 16px", borderRadius: 8, border: "none", background: "var(--wm-er-accent-shift, #16a34a)", color: "#fff", cursor: "pointer" }}>
                  Use Template
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}