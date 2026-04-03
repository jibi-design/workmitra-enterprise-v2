// src/features/employee/careerJobs/pages/EmployeeCareerWorkspacePage.tsx
//
// Single career workspace — updates feed, job info, rate employer.
// Rating: WorkerRateEmployerModal → ratingStorage (shared system).
// Trust: EmployerTrustBadge shows employer rating in header.

import { useCallback, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { RatingDisplayCard } from "../../../../shared/rating/components/RatingDisplayCard";
import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { getCareerWorkspacesSnapshot, subscribeCareerWorkspaces } from "../helpers/careerWorkspaceHooks";
import {
  fmtDateTime, statusTone, statusLabel, isRatableStatus,
  toneBadgeStyle, statusExplanation, explanationBorder, explanationBg,
} from "../helpers/careerWorkspaceDisplayHelpers";
import { InfoRow, UpdateCard } from "../components/CareerWorkspaceComponents";
import { CareerWorkspaceEmploymentSection } from "../components/CareerWorkspaceEmploymentSection";

export function EmployeeCareerWorkspacePage() {
  const nav = useNavigate();
  const { workspaceId = "" } = useParams();
  const allWs = useSyncExternalStore(subscribeCareerWorkspaces, getCareerWorkspacesSnapshot, getCareerWorkspacesSnapshot);
  const workspace = allWs.find((w) => w.id === workspaceId) ?? null;

  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const handleRatingSubmitted = useCallback(() => {
    setRatingOpen(false);
    setNotice({ title: "Rating submitted", message: "Thank you for your feedback.", tone: "success" });
  }, [setRatingOpen, setNotice]);

  if (!workspace) {
    return (
      <div>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Workspace</div>
            <div className="wm-pageSub">Not found.</div>
          </div>
        </div>
        <div className="wm-ee-card" style={{ marginTop: 12, textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>
            This workspace is not available.
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 6 }}>
            It may have been removed or not yet created.
          </div>
          <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employeeCareerHome)} style={{ marginTop: 12, fontSize: 12 }}>
            Career Home
          </button>
        </div>
      </div>
    );
  }

  const tone = statusTone(workspace.status);
  const explain = statusExplanation(workspace.status);
  const workerWmId = employeeProfileStorage.get().uniqueId ?? "";
  const employerWmId = employerSettingsStorage.get().uniqueId ?? "";
  const canRate = isRatableStatus(workspace.status) && !!workerWmId && !!employerWmId;
  const hasRated = workerWmId && employerWmId
    ? ratingStorage.hasWorkerRatedEmployer(workerWmId, workspace.jobId, employerWmId)
    : false;

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="wm-pageTitle">{workspace.jobTitle}</div>
            <span style={{ height: 24, padding: "0 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 700, ...toneBadgeStyle(tone) }}>
              {statusLabel(workspace.status)}
            </span>
          </div>
          <div className="wm-pageSub">
            {workspace.companyName}
            {workspace.department ? ` — ${workspace.department}` : ""}
            {workspace.location ? ` | ${workspace.location}` : ""}
          </div>
          <EmployerTrustBadge variant="full" />
        </div>
        <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employeeCareerHome)} style={{ fontSize: 11 }}>
          Back
        </button>
      </div>

      {/* Status explanation */}
      {explain && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 14, border: `1px solid ${explanationBorder(explain.tone)}`, background: explanationBg(explain.tone) }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>{explain.title}</div>
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 4, lineHeight: 1.6 }}>{explain.body}</div>
        </div>
      )}

      {/* Job info card */}
      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 10 }}>Position details</div>
        <div style={{ display: "grid", gap: 6 }}>
          <InfoRow label="Job Title" value={workspace.jobTitle} />
          <InfoRow label="Company" value={workspace.companyName} />
          <InfoRow label="Department" value={workspace.department} />
          <InfoRow label="Location" value={workspace.location} />
          <InfoRow label="Hired On" value={workspace.hiredAt ? fmtDateTime(workspace.hiredAt) : ""} />
        </div>
      </div>

      {/* Updates feed */}
      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 10 }}>
          Updates ({workspace.updates.length})
        </div>
        {workspace.updates.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>
            No updates yet. Employer communications will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {workspace.updates.map((u) => <UpdateCard key={u.id} update={u} />)}
          </div>
        )}
      </div>

     {/* Employment lifecycle */}
      <CareerWorkspaceEmploymentSection
        careerPostId={workspace.jobId}
        companyName={workspace.companyName}
        noticePeriodDays={0}
        onNotice={setNotice}
      />

      {/* Rate employer */}
      {canRate && !hasRated && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text, #111827)" }}>Rate employer</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", fontWeight: 500, lineHeight: 1.5 }}>
            Share your experience. Your rating helps other workers choose good employers.
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-primarybtn" type="button" onClick={() => setRatingOpen(true)} style={{ background: "var(--wm-er-accent-career, #1d4ed8)" }}>
              Rate Employer
            </button>
          </div>
        </div>
      )}
      {hasRated && isRatableStatus(workspace.status) && (
        <RatingDisplayCard
          jobId={workspace.jobId}
          jobTitle={workspace.jobTitle}
          raterWmId={workerWmId}
          targetWmId={employerWmId}
          targetName={workspace.companyName}
          ratingType="worker"
          domain="career"
        />
      )}

      {/* Worker rates employer modal */}
      <WorkerRateEmployerModal
        isOpen={ratingOpen} jobId={workspace.jobId} jobTitle={workspace.jobTitle}
        workerWmId={workerWmId} employerWmId={employerWmId} companyName={workspace.companyName}
        domain="career" onSubmitted={handleRatingSubmitted} onClose={() => setRatingOpen(false)}
      />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}