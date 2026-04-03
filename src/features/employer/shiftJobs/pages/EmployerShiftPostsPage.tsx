// src/features/employer/shiftJobs/pages/EmployerShiftPostsPage.tsx
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employerShiftStorage, type ShiftPost } from "../storage/employerShift.storage";
import { shiftTemplatesStorage } from "../storage/shiftTemplatesStorage";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function fmtDateRange(s: number, e: number): string {
  try {
    const sd = new Date(s); const ed = new Date(e);
    const st = sd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const et = ed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sd.toDateString() === ed.toDateString() ? st : `${st} - ${et}`;
  } catch { return "Date"; }
}

function statusLabel(p: ShiftPost): string {
  if (p.status === "completed") return "Completed";
  if (p.status === "cancelled") return p.endAt < Date.now() ? "Expired" : "Cancelled";
  if (p.confirmedIds.length > 0) return "Active";
  if (p.analysisStatus === "done") return "Reviewed";
  return "Open";
}

function statusColor(p: ShiftPost): string {
  if (p.status === "completed") return "var(--wm-er-muted)";
  if (p.status === "cancelled") return "var(--wm-error, #dc2626)";
  if (p.confirmedIds.length > 0) return "var(--wm-success)";
  if (p.analysisStatus === "done") return "var(--wm-warning)";
  return "var(--wm-er-accent-shift)";
}

const APPS_KEY = "wm_employee_shift_applications_v1";

function countAppsForPost(postId: string): number {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return 0;
    return (arr as Record<string, unknown>[]).filter(
      (a) => a && a["postId"] === postId && a["status"] === "applied",
    ).length;
  } catch { return 0; }
}

let cRaw: string | null = null;
let cList: ShiftPost[] = [];

function getSnap(): ShiftPost[] {
  const raw = localStorage.getItem("wm_employer_shift_posts_v1");
  if (raw === cRaw) return cList;
  cRaw = raw; cList = employerShiftStorage.getPosts(); return cList;
}

function sub(cb: () => void): () => void {
  const h = () => cb();
  const ev    = employerShiftStorage._events?.employerShiftPostsChanged ?? "wm:employer-shift-posts-changed";
  const appsEv = employerShiftStorage._events?.employeeAppsChanged ?? "wm:employee-shift-applications-changed";
  window.addEventListener("storage", h);
  window.addEventListener("focus", h);
  document.addEventListener("visibilitychange", h);
  window.addEventListener(ev, h);
  window.addEventListener(appsEv, h);
  return () => {
    window.removeEventListener("storage", h);
    window.removeEventListener("focus", h);
    document.removeEventListener("visibilitychange", h);
    window.removeEventListener(ev, h);
    window.removeEventListener(appsEv, h);
  };
}

function IconPlus() {
  return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" /></svg>;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerShiftPostsPage() {
  const nav   = useNavigate();
  const posts = useSyncExternalStore(sub, getSnap, getSnap);
  useEffect(() => { employerShiftStorage.checkExpiredPosts(); }, []);

  /* Save as template state */
  const [savingPostId, setSavingPostId]   = useState<string | null>(null);
  const [templateName, setTemplateName]   = useState("");
  const [saveSuccess, setSaveSuccess]     = useState("");

  const kpi = useMemo(() => {
    let open = 0; let active = 0; let reviewed = 0;
    for (const p of posts) {
      if (p.confirmedIds.length > 0) active++;
      else if (p.analysisStatus === "done") reviewed++;
      else open++;
    }
    return { total: posts.length, open, active, reviewed };
  }, [posts]);

  function handleSaveTemplate(post: ShiftPost) {
    const name = templateName.trim() || `${post.jobName} template`;
    shiftTemplatesStorage.saveTemplate(name, {
      jobName:        post.jobName,
      companyName:    post.companyName,
      category:       post.category,
      experience:     post.experience,
      payPerDay:      post.payPerDay,
      locationName:   post.locationName,
      description:    post.description,
      shiftTiming:    post.shiftTiming,
      vacancies:      post.vacancies,
      waitingBuffer:  post.waitingBuffer,
      mustHave:       post.mustHave,
      goodToHave:     post.goodToHave,
      whatWeProvide:  post.whatWeProvide,
      quickQuestions: post.quickQuestions,
      dressCode:      post.dressCode,
    });
    setSavingPostId(null);
    setTemplateName("");
    setSaveSuccess(`Saved as "${name}"`);
    setTimeout(() => setSaveSuccess(""), 2500);
  }

  return (
    <div className="wm-er-vShift">
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">My Posts</div>
          <div className="wm-pageSub">All your shift posts</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="wm-outlineBtn" type="button"
            onClick={() => nav(ROUTE_PATHS.employerShiftTemplates)}
            style={{ fontSize: 12 }}>
            Templates
          </button>
          <button className="wm-primarybtn" type="button"
            onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <IconPlus /> New Shift
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Total</div>
          <div className="wm-er-tileValue">{kpi.total}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Open</div>
          <div className="wm-er-tileValue" style={{ color: kpi.open > 0 ? "var(--wm-er-accent-shift)" : undefined }}>{kpi.open}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Active</div>
          <div className="wm-er-tileValue" style={{ color: kpi.active > 0 ? "var(--wm-success)" : undefined }}>{kpi.active}</div>
        </div>
      </div>

      {/* Save success toast */}
      {saveSuccess && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 10,
          background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
          fontSize: 12, fontWeight: 600, color: "var(--wm-er-accent-shift, #16a34a)",
        }}>
          &#10003; {saveSuccess}
        </div>
      )}

      {/* Posts list */}
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {posts.length === 0 && (
          <div className="wm-er-card" style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>No shift posts yet</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
              Create your first shift post. Workers in your area will see it and apply.
            </div>
            <button className="wm-primarybtn" type="button"
              onClick={() => nav(ROUTE_PATHS.employerShiftCreate)}
              style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IconPlus /> Create First Shift
            </button>
          </div>
        )}

        {posts.map((p) => {
          const apps      = countAppsForPost(p.id);
          const needsAnalysis = !p.analysisStatus || p.analysisStatus !== "done";
          const route     = ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", p.id);
          const isSaving  = savingPostId === p.id;

          return (
            <div key={p.id} className="wm-er-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Main post button */}
              <button type="button" onClick={() => nav(route)}
                style={{ width: "100%", padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                aria-label={`Open ${p.jobName} at ${p.companyName}`}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.jobName} &mdash; {p.companyName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
                      {p.locationName} &middot; {fmtDateRange(p.startAt, p.endAt)} &middot; {p.vacancies} {p.vacancies === 1 ? "vacancy" : "vacancies"}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: statusColor(p),
                    padding: "2px 8px", borderRadius: 999,
                    border: `1px solid ${statusColor(p)}`,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {statusLabel(p)}
                  </span>
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 12, fontSize: 12, color: "var(--wm-er-muted)" }}>
                  <span>{apps} applied</span>
                  <span>{p.confirmedIds.length} confirmed</span>
                  <span>{Math.max(0, p.vacancies - p.confirmedIds.length)} remaining</span>
                </div>

                {/* Next step */}
                <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(15,118,110,0.05)", border: "1px solid rgba(15,118,110,0.12)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>
                    {apps === 0 && "Tap to manage this post"}
                    {apps > 0 && needsAnalysis && `${apps} applied \u2014 tap to find best candidates`}
                    {!needsAnalysis && p.confirmedIds.length === 0 && "Candidates ready \u2014 tap to confirm workers"}
                    {p.confirmedIds.length > 0 && p.confirmedIds.length < p.vacancies && `${p.vacancies - p.confirmedIds.length} more needed \u2014 tap to continue`}
                    {p.confirmedIds.length >= p.vacancies && "All workers confirmed"}
                  </div>
                </div>

                <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
                  Pay: {p.payPerDay} / day
                </div>
              </button>

              {/* Save as template section */}
              <div style={{ borderTop: "1px solid var(--wm-er-border)", padding: "8px 14px", background: "var(--wm-er-surface)" }}>
                {!isSaving ? (
                  <button type="button"
                    onClick={() => { setSavingPostId(p.id); setTemplateName(`${p.jobName} template`); }}
                    style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    &#128203; Save as Template
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      className="wm-input"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(p); if (e.key === "Escape") setSavingPostId(null); }}
                      placeholder="Template name"
                      maxLength={60}
                      style={{ flex: 1, fontSize: 12, height: 34 }}
                      autoFocus
                    />
                    <button type="button" onClick={() => handleSaveTemplate(p)}
                      style={{ fontSize: 12, fontWeight: 700, padding: "0 12px", height: 34, borderRadius: 8, border: "none", background: "var(--wm-er-accent-shift, #16a34a)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Save
                    </button>
                    <button type="button" onClick={() => setSavingPostId(null)}
                      style={{ fontSize: 12, padding: "0 10px", height: 34, borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-muted)", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}