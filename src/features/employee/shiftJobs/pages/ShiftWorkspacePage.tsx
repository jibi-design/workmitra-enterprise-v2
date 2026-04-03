// src/features/employee/shiftJobs/pages/ShiftWorkspacePage.tsx
//
// Shift workspace detail — updates, reply, exit, rate employer.
// Rating: WorkerRateEmployerModal → ratingStorage (shared system).
// Trust: EmployerTrustBadge shows employer rating in header.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { ShiftWorkspaceUpdateFeed } from "../components/ShiftWorkspaceUpdateFeed";
import { ShiftWorkspaceExitSection } from "../components/ShiftWorkspaceExitSection";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import {
  fmtDateRange, isReadOnlyStatus, statusBadgeLabel, statusTone,
  badgeStyle, buildStatusExplanation, explanationBorderColor, explanationBgColor,
} from "../helpers/shiftWorkspaceDisplayHelpers";

export function ShiftWorkspacePage() {
  const nav = useNavigate();
  const { workspaceId = "" } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const workspace = useMemo(
    () => shiftWorkspacesStorage.getById(workspaceId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaceId, refreshKey],
  );
  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

 useEffect(() => { if (workspaceId) shiftWorkspacesStorage.markRead(workspaceId); }, [workspaceId]);

  const handleRatingSubmitted = useCallback(() => {
    setRatingOpen(false);
    setRefreshKey((k) => k + 1);
    setNotice({ title: "Rating submitted", message: "Thank you for your feedback.", tone: "success" });
  }, []);

  const handleReplySuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setNotice({ title: "Reply sent", message: "Your reply is saved. Employer will see it.", tone: "success" });
  }, []);

  if (!workspace) {
    return (
      <div className="wm-ee-vShift">
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Workspace</div>
            <div className="wm-pageSub">Not found.</div>
          </div>
        </div>
        <div className="wm-ee-card" style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "28px 16px", textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
            This workspace is not available.
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}>
            Use the top bar Back/Home icons to continue.
          </div>
        </div>
      </div>
    );
  }

  const readOnly = isReadOnlyStatus(workspace.status);
  const explain = buildStatusExplanation(workspace);
  const topTone = statusTone(workspace.status);
  const title = `${workspace.companyName} — ${workspace.jobName}`;
  const workerWmId = employeeProfileStorage.get().uniqueId ?? "";
  const employerWmId = employerSettingsStorage.get().uniqueId ?? "";
  const canRate = workspace.status === "completed" && !!workerWmId && !!employerWmId;
  const hasRated = workspace.rating
    ? true
    : (workerWmId && employerWmId ? ratingStorage.hasWorkerRatedEmployer(workerWmId, workspace.postId, employerWmId) : false);

  return (
    <div className="wm-ee-vShift">
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle" style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span>{title}</span>
            <span style={{ height: 26, padding: "0 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, ...badgeStyle(topTone) }}>
              {statusBadgeLabel(workspace.status)}
            </span>
          </div>
          <div className="wm-pageSub">{workspace.locationName} · {fmtDateRange(workspace.startAt, workspace.endAt)}</div>
          <EmployerTrustBadge variant="full" />
        </div>
      </div>

      {/* Status explanation */}
      {explain && (
        <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: "var(--wm-radius-14)", border: `1px solid ${explanationBorderColor(explain.tone)}`, background: explanationBgColor(explain.tone) }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)" }}>{explain.title}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500, lineHeight: 1.5 }}>{explain.body}</div>
          {readOnly && (
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: "var(--wm-emp-muted)", opacity: 0.8 }}>
              Read-only: actions are disabled for this workspace.
            </div>
          )}
        </div>
      )}

      {/* Updates + Reply */}
      <ShiftWorkspaceUpdateFeed workspace={workspace} readOnly={readOnly} onReplySuccess={handleReplySuccess} />

      {/* Rate employer */}
      {canRate && !hasRated && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>Rate employer</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500, lineHeight: 1.5 }}>
            Share your experience. Your rating helps other workers choose good employers.
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-primarybtn" type="button" onClick={() => setRatingOpen(true)}>Rate Employer</button>
          </div>
        </div>
      )}
      {hasRated && workspace.status === "completed" && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>Rating submitted</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500 }}>
            Thank you for your feedback. This helps build trust for everyone.
          </div>
        </div>
      )}

      {/* Leave workspace + exit flow */}
      <ShiftWorkspaceExitSection workspace={workspace} readOnly={readOnly} onExited={() => nav(ROUTE_PATHS.employeeShiftWorkspaces)} />

      {/* Worker rates employer modal */}
      <WorkerRateEmployerModal
        isOpen={ratingOpen} jobId={workspace.postId} jobTitle={workspace.jobName}
        workerWmId={workerWmId} employerWmId={employerWmId} companyName={workspace.companyName}
        domain="shift" onSubmitted={handleRatingSubmitted} onClose={() => setRatingOpen(false)}
      />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}