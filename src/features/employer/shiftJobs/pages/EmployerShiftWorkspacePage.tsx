// src/features/employer/shiftJobs/pages/EmployerShiftWorkspacePage.tsx
//
// Employer Shift Workspace — main page. Orchestration only.
// Domain: Shift Jobs Green -- var(--wm-er-accent-shift)

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ShiftPostEventRatingModal } from "../components/ShiftPostEventRatingModal";
import {
  BroadcastModal, ReplyModal, UpdateCard, RatingBanner,
} from "../components/ShiftWorkspaceComponents";
import {
  getWorkspacesSnapshot, subscribeWorkspaces,
  saveWorkspaces, pushEmployeeShiftNotification,
} from "../storage/shiftWorkspaceStorage";
import {
  statusLabel, isReadOnlyStatus, fmtDateRange,
  clampText, wsId,
} from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspace, ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";

/* ------------------------------------------------ */
/* Draft type                                       */
/* ------------------------------------------------ */
type Draft = { title: string; body: string };

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerShiftWorkspacePage() {
  const nav = useNavigate();
  const params = useParams();
  const workspaceId = params.workspaceId ?? "";

  const all = useSyncExternalStore(subscribeWorkspaces, getWorkspacesSnapshot, getWorkspacesSnapshot);
  const workspace = useMemo(() => all.find((w) => w.id === workspaceId) ?? null, [all, workspaceId]);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState<Draft>({ title: "Announcement", body: "" });
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState<Draft>({ title: "Reply (Employer)", body: "" });
  const [ratingOpen, setRatingOpen] = useState(false);

  const readOnly = workspace ? isReadOnlyStatus(workspace.status) : true;
  const isCompleted = workspace?.status === "completed";
  const hasRating = workspace
    ? typeof (workspace as Record<string, unknown>)["employerRating"] === "number" &&
      ((workspace as Record<string, unknown>)["employerRating"] as number) > 0
    : false;

  /* ---- Broadcast ---- */
  function pushBroadcast() {
    if (!workspace || readOnly) return;
    const title = clampText(broadcastDraft.title, 60) || "Announcement";
    const body = clampText(broadcastDraft.body, 240);
    const now = Date.now();
    const updBase: ShiftWorkspaceUpdate = { id: wsId("u"), createdAt: now, kind: "broadcast", title };
    const upd: ShiftWorkspaceUpdate = body ? { ...updBase, body } : updBase;
    const next = all.map((w) => w.id !== workspace.id ? w : {
      ...w, updates: [upd, ...w.updates].slice(0, 50),
      lastActivityAt: now, unreadCount: Math.max(0, w.unreadCount) + 1,
    });
    saveWorkspaces(next);
    const route = ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspace.id);
    pushEmployeeShiftNotification(
      "New announcement",
      `${workspace.jobName} - ${workspace.companyName}. ${title}${body ? `: ${body.slice(0, 60)}` : ""}`,
      route,
    );
    setBroadcastOpen(false);
  }

  /* ---- Reply ---- */
  function sendDirectReply() {
    if (!workspace || readOnly) return;
    const title = clampText(replyDraft.title, 60) || "Reply (Employer)";
    const body = clampText(replyDraft.body, 240);
    if (!body) return;
    const now = Date.now();
    const upd: ShiftWorkspaceUpdate = { id: wsId("u"), createdAt: now, kind: "direct", title, body };
    const next = all.map((w) => w.id !== workspace.id ? w : {
      ...w, updates: [upd, ...w.updates].slice(0, 50),
      lastActivityAt: now, unreadCount: Math.max(0, w.unreadCount) + 1,
    });
    saveWorkspaces(next);
    const route = ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspace.id);
    pushEmployeeShiftNotification(
      "New message",
      `${workspace.jobName} - ${workspace.companyName}. Employer replied in workspace.`,
      route,
    );
    setReplyOpen(false);
  }

  /* ---- Mark Completed ---- */
  function markCompleted() {
    if (!workspace || readOnly || workspace.status === "completed") return;
    const now = Date.now();
    const upd: ShiftWorkspaceUpdate = {
      id: wsId("u"), createdAt: now, kind: "system",
      title: "Marked completed",
      body: "Employer marked this assignment as completed.",
    };
    const next = all.map((w) => w.id !== workspace.id ? w : {
      ...w, status: "completed" as const,
      updates: [upd, ...w.updates].slice(0, 50),
      lastActivityAt: now, unreadCount: Math.max(0, w.unreadCount) + 1,
    });
    saveWorkspaces(next);
  }

  /* ---- Rating Submit ---- */
  function handleRatingSubmit(rating: number, comment: string) {
    if (!workspace) return;
    const now = Date.now();
    const next = all.map((w) => w.id !== workspace.id ? w : {
      ...w, employerRating: rating, employerRatingComment: comment, employerRatedAt: now,
    });
    saveWorkspaces(next as ShiftWorkspace[]);
    setRatingOpen(false);
  }

  /* ---- Not found ---- */
  if (!workspace) {
    return (
      <div>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Workspace</div>
            <div className="wm-pageSub">Not found.</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }} className="wm-er-card">
          <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>
            This workspace is not available.
          </div>
        </div>
      </div>
    );
  }

  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const range = fmtDateRange(workspace.startAt, workspace.endAt);

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">
            {title}
            <span className="wm-pillNeutral" style={{ marginLeft: 8 }}>
              {statusLabel(workspace.status)}
            </span>
          </div>
          <div className="wm-pageSub">
            {workspace.locationName} &middot; {range} &middot; ID {workspace.id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Employer Controls */}
      <div style={{ marginTop: 12 }} className="wm-er-card wm-er-accentCard wm-er-vShift">
        <div className="wm-er-headTint">
          <div style={{ fontWeight: 700 }}>Employer Controls</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
            Announcements appear as <b>ANNOUNCEMENT</b>. Replies appear as <b>DIRECT</b>. Employee gets notified on both.
          </div>

          {workspace.status === "left" && (
            <div style={{
              marginTop: 10, padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,60,90,0.08)", border: "1px solid rgba(255,60,90,0.30)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>
                Worker left this workspace
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
                {workspace.exitReason ? `Reason: ${workspace.exitReason}.` : ""} Check waiting list to fill the vacancy.
              </div>
              <button
                className="wm-dangerBtn" type="button" style={{ marginTop: 10 }}
                onClick={() => nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", workspace.postId))}
              >
                Fill Vacancy from Waiting List
              </button>
            </div>
          )}

          {readOnly && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>
              Read-only: this workspace is {statusLabel(workspace.status)}.
            </div>
          )}

          {/* Rating Banner */}
          {isCompleted && (
            <RatingBanner
              workspace={workspace}
              hasRating={hasRating}
              onRate={() => setRatingOpen(true)}
            />
          )}

          {/* Action Buttons */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              className="wm-outlineBtn" type="button"
              onClick={() => nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", workspace.postId))}
            >
              Open Post
            </button>
            <button
              className="wm-outlineBtn" type="button"
              onClick={() => { setBroadcastDraft({ title: "Announcement", body: "" }); setBroadcastOpen(true); }}
              disabled={readOnly} aria-disabled={readOnly}
            >
              Broadcast
            </button>
            <button
              className="wm-primarybtn" type="button"
              onClick={() => { setReplyDraft({ title: "Reply (Employer)", body: "" }); setReplyOpen(true); }}
              disabled={readOnly} aria-disabled={readOnly}
            >
              Reply to Worker
            </button>
            <button
              className="wm-primarybtn" type="button"
              onClick={markCompleted}
              disabled={workspace.status === "completed" || readOnly}
              aria-disabled={workspace.status === "completed" || readOnly}
            >
              Mark Completed
            </button>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div style={{ marginTop: 12 }} className="wm-er-card">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 700 }}>Updates</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-muted)" }}>
            Total: {workspace.updates.length}
          </div>
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {workspace.updates.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No updates yet.</div>
          ) : (
            workspace.updates.map((u) => <UpdateCard key={u.id} u={u} />)
          )}
        </div>
      </div>

      <div style={{ height: 32 }} />

      {/* Modals */}
      {broadcastOpen && (
        <BroadcastModal
          draft={broadcastDraft}
          onDraftChange={setBroadcastDraft}
          onSend={pushBroadcast}
          onClose={() => setBroadcastOpen(false)}
        />
      )}

      {replyOpen && (
        <ReplyModal
          draft={replyDraft}
          onDraftChange={setReplyDraft}
          onSend={sendDirectReply}
          onClose={() => setReplyOpen(false)}
          readOnly={readOnly}
        />
      )}

      <ShiftPostEventRatingModal
        isOpen={ratingOpen}
        workspaceName={`${workspace.companyName} - ${workspace.jobName}`}
        workerName="Worker"
        onSubmit={handleRatingSubmit}
        onClose={() => setRatingOpen(false)}
      />
    </div>
  );
}