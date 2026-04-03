// src/features/employer/shiftJobs/pages/EmployerShiftPostDashboardPage.tsx
//
// Shift Post Dashboard — orchestration only.
// Smart Selection: applied tab shows Top Picks / Good Fit / Others after analysis.
// Mandatory Rating: fullscreen blocking overlay when shift completed + rating pending.

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getPostsSnapshot, getAppsSnapshot, getActivitySnapshot,
  getWorkspacesSnapshot, subscribeDashboard, findWorkspaceIdForPost,
} from "../helpers/dashboardHelpers";
import { employerShiftStorage } from "../storage/employerShift.storage";
import type { PriorityTag, PostSettings } from "../storage/employerShift.storage";
import { CandidateCard } from "../components/CandidateCard";
import { SmartCandidateGroups } from "../components/SmartCandidateGroups";
import { ShiftRatingSection } from "../components/ShiftRatingSection";
import { ShiftEditModal } from "../components/ShiftEditModal";
import { CompareApplicantsModal, type ComparableApplicant } from "../../../../shared/components/CompareApplicantsModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import type { DashboardTab } from "../helpers/shiftDashboardHelpers";
import { fmtDateTime } from "../helpers/shiftDashboardHelpers";
import {
  PriorityBadge, VacancyProgress, AnalysisBar,
  DashboardTabs, SettingsPanel,
} from "../components/ShiftDashboardComponents";

/* ------------------------------------------------ */
/* Rating completion flag helpers                   */
/* ------------------------------------------------ */
function getRatingDoneFlag(postId: string): boolean {
  try { return localStorage.getItem(`wm_shift_rated_${postId}`) === "1"; } catch { return false; }
}

function setRatingDoneFlag(postId: string): void {
  try { localStorage.setItem(`wm_shift_rated_${postId}`, "1"); } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Rating Block Overlay                             */
/* ------------------------------------------------ */
type RatingBlockProps = {
  post: ReturnType<typeof employerShiftStorage.getPost>;
  confirmedApps: ReturnType<typeof getAppsSnapshot>;
  onDone: () => void;
};

function RatingBlockOverlay({ post, confirmedApps, onDone }: RatingBlockProps) {
  if (!post) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.80)",
        display: "flex", alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "24px 16px 48px",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16, padding: "20px 20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(217,119,6,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#d97706" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Rate Workers to Close Shift
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              This shift has ended. Rating is mandatory and cannot be skipped.
            </div>
          </div>
        </div>

        <div style={{
          marginBottom: 14, padding: "10px 12px", borderRadius: 10,
          background: "rgba(217,119,6,0.06)",
          border: "1px solid rgba(217,119,6,0.2)",
          fontSize: 12, color: "#92400e", lineHeight: 1.5,
        }}>
          You must rate all confirmed workers before this shift can be closed.
          Ratings build trust and cannot be skipped.
        </div>

        <ShiftRatingSection
          post={post}
          confirmedApps={confirmedApps}
          onShiftClosed={onDone}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerShiftPostDashboardPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();

  const posts         = useSyncExternalStore(subscribeDashboard, getPostsSnapshot, getPostsSnapshot);
  const appsAll       = useSyncExternalStore(subscribeDashboard, getAppsSnapshot, getAppsSnapshot);
  const activityAll   = useSyncExternalStore(subscribeDashboard, getActivitySnapshot, getActivitySnapshot);
  const workspacesAll = useSyncExternalStore(subscribeDashboard, getWorkspacesSnapshot, getWorkspacesSnapshot);

  const post     = useMemo(() => posts.find((p) => p.id === postId) ?? null, [posts, postId]);
  const apps     = useMemo(() => appsAll.filter((a) => a.postId === postId), [appsAll, postId]);
  const activity = useMemo(() => activityAll.filter((a) => a.postId === postId).slice(0, 15), [activityAll, postId]);
  const wsLite   = useMemo(() => workspacesAll.find((w) => w.postId === postId) ?? null, [workspacesAll, postId]);

  const [tab, setTab]                   = useState<DashboardTab>("applied");
  const [isBusy, setIsBusy]             = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLog, setShowLog]           = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [notice, setNotice]             = useState<NoticeData | null>(null);
  const [confirmData, setConfirmData]   = useState<ConfirmData | null>(null);
  const [confirmFn, setConfirmFn]       = useState<(() => void) | null>(null);
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

  /* ── Rating completion flag — persistent across sessions ── */
  const [ratingCompleted, setRatingCompleted] = useState(
    () => getRatingDoneFlag(postId),
  );

  const settings: PostSettings = post?.settings ?? {
    backupSlots: 2, autoPromoteBackup: true, notifyBackup: true,
  };

  const appliedApps   = useMemo(() => apps.filter((a) => a.status === "applied"),     [apps]);
  const shortlistApps = useMemo(() => apps.filter((a) => a.status === "shortlisted"), [apps]);
  const backupApps    = useMemo(() => apps.filter((a) => a.status === "waiting"),     [apps]);
  const selectedApps  = useMemo(() => apps.filter((a) => a.status === "confirmed"),   [apps]);
  const rejectedApps  = useMemo(() => apps.filter((a) => a.status === "rejected"),    [apps]);

  const priorityTags = useMemo(() => {
    const map: Record<string, PriorityTag | undefined> = {};
    for (const a of apps) map[a.id] = a.priorityTag;
    return map;
  }, [apps]);

  const tabCounts: Record<DashboardTab, number> = {
    applied:     appliedApps.length,
    shortlisted: shortlistApps.length,
    backup:      backupApps.length,
    selected:    selectedApps.length,
    rejected:    rejectedApps.length,
  };

  const tabApps = {
    applied: appliedApps, shortlisted: shortlistApps,
    backup: backupApps, selected: selectedApps, rejected: rejectedApps,
  }[tab];

  const analysisStatus  = post?.analysisStatus ?? "not_started";
  const alreadyAnalyzed = analysisStatus === "done";
  const canAnalyze      = analysisStatus === "not_started" && appliedApps.length > 0;
  const backupSlots     = settings.backupSlots ?? 2;
  const useSmartGroups  = alreadyAnalyzed && tab === "applied";

  /* ── Blocking overlay: shift completed + workers exist + rating not done ── */
  const showRatingBlock = (
    post?.status === "completed"
    && selectedApps.length > 0
    && !ratingCompleted
  );

  /* ── Inline rating section: shift active + confirmed workers ── */
  const showRatingSection = selectedApps.length > 0 && post?.status !== "completed";

  /* ── Handlers ── */
  function busy(fn: () => void) {
    setIsBusy(true);
    try { fn(); } finally { window.setTimeout(() => setIsBusy(false), 400); }
  }

  function openConfirm(data: ConfirmData, fn: () => void) {
    setConfirmData(data);
    setConfirmFn(() => fn);
  }

  function closeConfirm() { setConfirmData(null); setConfirmFn(null); }

  function handleAnalyze() {
    if (!canAnalyze) return;
    busy(() => {
      employerShiftStorage.analyzeOnce(postId, { hideFromSearch: false });
      setTab("shortlisted");
    });
  }

  function handleReset() {
    openConfirm(
      {
        title: "Reset Analysis?",
        message: "This will clear shortlist and backup. Candidates return to Applied. Cannot be undone.",
        tone: "danger", confirmLabel: "Reset",
      },
      () => busy(() => {
        employerShiftStorage.resetAnalysis(postId, "Manual reset by employer", { unhideFromSearch: true });
        setTab("applied");
      }),
    );
  }

  function handleOpenGroup() {
    const wsId = findWorkspaceIdForPost(postId) ?? wsLite?.id;
    if (wsId) nav(ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", wsId));
    else setNotice({ title: "No workspace", message: "Confirm a candidate first to create a workspace." });
  }

  function handlePriorityTag(appId: string, tag: PriorityTag | undefined) {
    employerShiftStorage.setPriorityTag(postId, appId, tag);
  }

  function handleDelete() {
    openConfirm(
      {
        title: "Delete this shift?",
        message: post!.confirmedIds.length > 0
          ? `${post!.confirmedIds.length} confirmed worker(s) will be notified that this shift is cancelled.`
          : "This shift and all applications will be permanently removed.",
        tone: "danger",
        confirmLabel: "Delete Shift",
        cancelLabel: "Cancel",
      },
      () => {
        employerShiftStorage.deletePost(postId);
        nav(ROUTE_PATHS.employerShiftPosts);
      },
    );
  }

  /* Called when ALL workers have been rated — unblock + persist flag */
  function handleShiftClosed() {
    setRatingDoneFlag(postId);
    setRatingCompleted(true);
    setNotice({
      title: "Shift Completed!",
      message: "All workers have been rated. This shift is now closed.",
      tone: "success",
    });
    setTab("selected");
  }

  const cardActions = {
    isBusy,
    onMoveToShortlist: (id: string) => busy(() => employerShiftStorage.moveToShortlist(postId, id)),
    onMoveToWaiting:   (id: string) => busy(() => employerShiftStorage.moveToWaiting(postId, id)),
    onConfirm:         (id: string) => busy(() => {
      employerShiftStorage.confirm(postId, id);
      setTab("selected");
    }),
    onOpenGroup:  handleOpenGroup,
    onRemove:     (id: string) => openConfirm(
      { title: "Remove candidate?", message: "This candidate will be moved to Rejected.", tone: "danger", confirmLabel: "Remove" },
      () => busy(() => employerShiftStorage.removeFromPicks(postId, id, "Removed by employer")),
    ),
    onReplace:    (id: string) => openConfirm(
      { title: "Replace selected worker?", message: "Worker will be removed. First backup candidate promoted automatically.", tone: "danger", confirmLabel: "Replace" },
      () => busy(() => employerShiftStorage.replaceConfirmed(postId, id, "other")),
    ),
  };

  if (!post) {
    return (
      <div>
        <div className="wm-pageHead"><div className="wm-pageTitle">Post Dashboard</div></div>
        <div className="wm-er-card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Post not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Mandatory Rating Block Overlay ── */}
      {showRatingBlock && (
        <RatingBlockOverlay
          post={post}
          confirmedApps={selectedApps}
          onDone={handleShiftClosed}
        />
      )}

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <ConfirmModal
        confirm={confirmData}
        onConfirm={() => { confirmFn?.(); closeConfirm(); }}
        onCancel={closeConfirm}
      />

      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">{post.jobName.toUpperCase()}</div>
          <div className="wm-pageSub">
            {post.companyName} &bull; {post.locationName} &bull; {post.vacancies}{" "}
            {post.vacancies === 1 ? "vacancy" : "vacancies"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {post.status !== "completed" && (
            <button className="wm-outlineBtn" type="button" style={{ fontSize: 11 }}
              onClick={() => setShowEdit(true)}>
              Edit
            </button>
          )}
          <button
            className="wm-outlineBtn" type="button"
            style={{ fontSize: 11, color: "var(--wm-error, #dc2626)" }}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button className="wm-outlineBtn" type="button" style={{ fontSize: 11 }}
            onClick={() => nav(ROUTE_PATHS.employerShiftPosts)}>
            All Posts
          </button>
        </div>
      </div>

      {/* Vacancy Progress */}
      <VacancyProgress
        confirmedCount={selectedApps.length}
        vacancies={post.vacancies}
        appliedCount={appliedApps.length}
        shortlistCount={shortlistApps.length}
        backupCount={backupApps.length}
        backupSlots={backupSlots}
      />

      {/* Inline Rating Section — active shifts only */}
      {showRatingSection && (
        <ShiftRatingSection
          post={post}
          confirmedApps={selectedApps}
          onShiftClosed={handleShiftClosed}
        />
      )}

      {/* Analysis Bar */}
      <AnalysisBar
        alreadyAnalyzed={alreadyAnalyzed}
        canAnalyze={canAnalyze}
        isBusy={isBusy}
        appliedCount={appliedApps.length}
        analyzedAt={post.analyzedAt}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
      />

      {/* Tabs */}
      <DashboardTabs activeTab={tab} counts={tabCounts} onChange={setTab} />

      {/* Tab hints */}
      {tab === "applied" && appliedApps.length > 0 && !alreadyAnalyzed && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Tap &ldquo;Analyze Now&rdquo; to auto-sort candidates, or manually add to Shortlisted.
        </div>
      )}
      {tab === "applied" && alreadyAnalyzed && appliedApps.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Candidates ranked by rating, level, and skill match.
        </div>
      )}
      {tab === "shortlisted" && shortlistApps.length === 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          No candidates shortlisted yet. Run analysis or manually add from Applied tab.
        </div>
      )}
      {tab === "selected" && selectedApps.length === 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          No candidates selected yet. Shortlist candidates and confirm them here.
        </div>
      )}

      {/* Smart Selection or Regular List */}
      {useSmartGroups ? (
        <div style={{ marginTop: 10 }}>
          <SmartCandidateGroups
            apps={appliedApps}
            tab={tab}
            priorityTags={priorityTags}
            quickQuestions={post.quickQuestions ?? []}
            onPriorityTag={handlePriorityTag}
            {...cardActions}
          />
        </div>
      ) : (
        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {tabApps.length === 0 && (
            <div className="wm-er-card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No candidates here.</div>
            </div>
          )}
          {compareIds.size >= 2 && (
            <button type="button" onClick={() => setCompareOpen(true)} style={{
              position: "sticky", top: 8, zIndex: 10, width: "100%", padding: "10px 16px", borderRadius: 10,
              border: "none", background: "var(--wm-er-accent-shift, #16a34a)", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              Compare {compareIds.size} candidates
            </button>
          )}
          {tabApps.map((app) => (
            <div key={app.id}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, paddingLeft: 2 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, fontWeight: 600, color: "var(--wm-er-muted)" }}>
                  <input type="checkbox" checked={compareIds.has(app.id)} onChange={() => toggleCompare(app.id)} disabled={!compareIds.has(app.id) && compareIds.size >= 3} />
                  {compareIds.has(app.id) ? "Selected" : "Compare"}
                </label>
                <PriorityBadge tag={app.priorityTag} />
                <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                  {(["priority", "good", "review"] as PriorityTag[]).map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => handlePriorityTag(app.id, app.priorityTag === t ? undefined : t)}
                      style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 999,
                        border: "1px solid var(--wm-er-border)",
                        background: app.priorityTag === t ? "var(--wm-er-accent-shift)" : "var(--wm-er-surface)",
                        color: app.priorityTag === t ? "#fff" : "var(--wm-er-muted)",
                        cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      {t === "priority" ? "Priority" : t === "good" ? "Good fit" : "Review"}
                    </button>
                  ))}
                </div>
              </div>
              <CandidateCard
                app={app}
                mode={
                  tab === "shortlisted" ? "shortlist"
                  : tab === "selected"  ? "confirmed"
                  : tab === "backup"    ? "waiting"
                  : tab
                }
                quickQuestions={post.quickQuestions ?? []}
                {...cardActions}
              />
            </div>
          ))}
        </div>
      )}

      {/* Settings & Automation */}
      <div style={{ marginTop: 16, borderRadius: 14, border: "1px solid var(--wm-er-border)", overflow: "hidden" }}>
        <button type="button" onClick={() => setShowAdvanced((v) => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "var(--wm-er-surface)", border: "none",
          cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)",
        }}>
          <span>Settings &amp; Automation</span>
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{showAdvanced ? "Hide" : "Show"}</span>
        </button>
        {showAdvanced && (
          <SettingsPanel
            settings={settings}
            backupCount={backupApps.length}
            onToggle={(key, val) =>
              employerShiftStorage.updateSettings(postId, { ...settings, [key]: val })
            }
          />
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && post && (
        <ShiftEditModal
          post={post}
          onSave={(updates) => {
            employerShiftStorage.editPost(postId, updates);
            setShowEdit(false);
            setNotice({ title: "Shift Updated", message: "Changes saved successfully.", tone: "success" });
          }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Compare Modal */}
      <CompareApplicantsModal
        isOpen={compareOpen}
        applicants={apps.filter((a) => compareIds.has(a.id)).map((a): ComparableApplicant => ({
          id: a.id,
          name: a.profileSnapshot?.fullName ?? `Worker ${a.id.slice(-4).toUpperCase()}`,
          wmId: a.profileSnapshot?.uniqueId ?? "",
          appliedAt: a.createdAt ?? Date.now(),
          status: a.status,
          skills: a.profileSnapshot?.skills ?? [],
          experience: a.profileSnapshot?.experience,
          requiredSkills: post.mustHave ?? [],
        }))}
        onClose={() => setCompareOpen(false)}
      />

      {/* Activity Log */}
      <div style={{ marginTop: 10, marginBottom: 24, borderRadius: 14, border: "1px solid var(--wm-er-border)", overflow: "hidden" }}>
        <button type="button" onClick={() => setShowLog((v) => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "var(--wm-er-surface)", border: "none",
          cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)",
        }}>
          <span>Activity Log</span>
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            {showLog ? "Hide" : `${activity.length} entries`}
          </span>
        </button>
        {showLog && (
          <div style={{ padding: "0 16px 16px", background: "var(--wm-er-surface)" }}>
            {activity.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", paddingTop: 8 }}>No activity yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 8, paddingTop: 8 }}>
                {activity.map((a) => (
                  <div key={a.id} style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}>
                        {fmtDateTime(a.createdAt)}
                      </div>
                    </div>
                    {a.body && (
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>{a.body}</div>
                    )}
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