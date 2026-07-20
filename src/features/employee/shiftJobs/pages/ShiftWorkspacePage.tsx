// App name: Job Mitra
// File name: ShiftWorkspacePage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\ShiftWorkspacePage.tsx

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { syncVaultShiftRatings } from "../../workVault/services/shiftVaultHistory.service";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { ShiftWorkspaceExitSection } from "../components/ShiftWorkspaceExitSection";
import { ShiftWorkspaceUpdateFeed } from "../components/ShiftWorkspaceUpdateFeed";
import {
  badgeStyle,
  buildStatusExplanation,
  explanationBgColor,
  explanationBorderColor,
  fmtDateRange,
  isReadOnlyStatus,
  statusBadgeLabel,
  statusTone,
} from "../helpers/shiftWorkspaceDisplayHelpers";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import { getEmployerShiftPosts } from "../../../employer/shiftJobs/storage/employerShift.postActions";
import { plannerPublicIndex } from "../../../employer/planner/storage/plannerPublicIndex.storage";

export function ShiftWorkspacePage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { workspaceId = "" } = useParams();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
    shiftWorkspacesStorage.getAll,
  );

  const workspace = workspaces.find((item) => item.id === workspaceId) ?? null;

  useEffect(() => {
    if (!workspace) return;
    const plannerPost = getEmployerShiftPosts().find((p) => p.id === workspace.postId);
    const isPlannerWorkspace = Boolean(plannerPost?.source === "planner" && plannerPost.planId);
    const onShiftWorkspaceRoute = loc.pathname.startsWith("/employee/shift/workspace/");
    const onPlannerWorkspaceRoute = loc.pathname.startsWith("/employee/planner/workspace/");
    if (isPlannerWorkspace && onShiftWorkspaceRoute) {
      nav(ROUTE_PATHS.employeePlannerWorkspace.replace(":workspaceId", workspaceId), {
        replace: true,
      });
    } else if (!isPlannerWorkspace && onPlannerWorkspaceRoute) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId), {
        replace: true,
      });
    }
  }, [workspace, workspaceId, loc.pathname, nav]);

  useEffect(() => {
    if (workspaceId) shiftWorkspacesStorage.markRead(workspaceId);
  }, [workspaceId]);

  const handleRatingSubmitted = useCallback(() => {
    const currentWorkspace = shiftWorkspacesStorage.getById(workspaceId);
    const workerWmId = employeeProfileStorage.get().uniqueId ?? "";
    const employerWmId = employerSettingsStorage.get().uniqueId ?? "";

    if (currentWorkspace && workerWmId && employerWmId) {
      const savedRating = ratingStorage.getWorkerRatingForJob(
        workerWmId,
        currentWorkspace.postId,
        employerWmId,
      );

      if (savedRating) {
        shiftWorkspacesStorage.saveRating(
          workspaceId,
          savedRating.stars,
          savedRating.comment ?? "",
        );

        const updatedWorkspace = shiftWorkspacesStorage.getById(workspaceId);
        if (updatedWorkspace) {
          syncVaultShiftRatings(updatedWorkspace);
        }
      }
    }

    reviewCenterStorage.resolveBySource({
      domain: "shift",
      sourceId: workspaceId,
      toRole: "employee",
      action: "employer_request_employee_review",
    });

    setRatingOpen(false);
    setNotice({
      title: "Rating submitted",
      message: "Thank you for your feedback.",
      tone: "success",
    });
  }, [workspaceId]);

  const handleReplySuccess = useCallback(() => {
    setNotice({
      title: "Reply sent",
      message: "Your reply is saved. The employer can see it inside the app.",
      tone: "success",
    });
  }, []);

  if (!workspace) {
    return (
      <div className="wm-ee-vShift">
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Work Group</div>
            <div className="wm-pageSub">Not found.</div>
          </div>
        </div>

        <div
          className="wm-ee-card"
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "28px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text)" }}>
            This work group is not available.
          </div>

          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}>
            Use Back or Home to continue.
          </div>
        </div>
      </div>
    );
  }

  const readOnly = isReadOnlyStatus(workspace.status);
  const explain = buildStatusExplanation(workspace);
  const topTone = statusTone(workspace.status);
  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const workerWmId = employeeProfileStorage.get().uniqueId ?? "";
  const employerWmId = employerSettingsStorage.get().uniqueId ?? "";
  const canRate = workspace.status === "completed" && Boolean(workerWmId) && Boolean(employerWmId);
  const hasRated = workspace.rating
    ? true
    : workerWmId && employerWmId
      ? ratingStorage.hasWorkerRatedEmployer(workerWmId, workspace.postId, employerWmId)
      : false;
  const safeMapsLink = getSafeExternalMapsUrl(workspace.mapsLink);
  const plannerPost = getEmployerShiftPosts().find((p) => p.id === workspace.postId);
  const planEntry =
    plannerPost?.planId && plannerPost.source === "planner"
      ? plannerPublicIndex.getByPlanId(plannerPost.planId)
      : null;
  const isPlannerDomain = loc.pathname.startsWith("/employee/planner/") || Boolean(planEntry);

  return (
    <div className={isPlannerDomain ? "wm-ee-vPlanner wm-planner-page" : "wm-ee-vShift"}>
      {planEntry ? (
        <div
          className="wm-planner-badge"
          style={{
            marginBottom: 10,
            display: "inline-flex",
            background: "rgba(8,145,178,0.12)",
            border: "1px solid var(--wm-planner-border)",
          }}
        >
          ?? Project: {planEntry.planName}
          {plannerPost?.planSlotDate ? ` � ${plannerPost.planSlotDate}` : ""}
        </div>
      ) : null}
      <section
        style={{
          marginTop: 2,
          padding: "16px 16px",
          borderRadius: 22,
          border: "1px solid rgba(22,163,74,0.16)",
          background:
            "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
          boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 950,
                color: "var(--wm-er-text)",
                lineHeight: 1.25,
              }}
            >
              {title}
            </div>

            <div
              style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
            >
              {workspace.locationName} � {fmtDateRange(workspace.startAt, workspace.endAt)}
            </div>

            {(workspace.locationAddress || safeMapsLink) && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 11px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(22,163,74,0.14)",
                }}
              >
                {workspace.locationAddress && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--wm-er-muted)",
                      lineHeight: 1.45,
                    }}
                  >
                    {workspace.locationAddress}
                  </div>
                )}

                {safeMapsLink && (
                  <a
                    href={safeMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: workspace.locationAddress ? 8 : 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: "#16a34a",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 950,
                      textDecoration: "none",
                    }}
                  >
                    Open location in Maps
                  </a>
                )}
              </div>
            )}
          </div>

          <span
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 950,
              whiteSpace: "nowrap",
              ...badgeStyle(topTone),
            }}
          >
            {statusBadgeLabel(workspace.status)}
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <EmployerTrustBadge variant="full" />
        </div>
      </section>

      {explain && (
        <section
          style={{
            marginTop: 12,
            padding: "14px 16px",
            borderRadius: 18,
            border: `1px solid ${explanationBorderColor(explain.tone)}`,
            background: explanationBgColor(explain.tone),
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-emp-text)" }}>
            {explain.title}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--wm-emp-muted)",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {explain.body}
          </div>

          {readOnly && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--wm-emp-muted)",
                opacity: 0.85,
              }}
            >
              Read-only: actions are disabled for this work group.
            </div>
          )}
        </section>
      )}

      <ShiftWorkspaceUpdateFeed
        workspace={workspace}
        readOnly={readOnly}
        onReplySuccess={handleReplySuccess}
      />

      {canRate && !hasRated && (
        <section
          className="wm-ee-card"
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
            boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
            Rate Employer
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--wm-emp-muted)",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            Share your experience. Your rating helps other workers choose good employers.
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-primarybtn" type="button" onClick={() => setRatingOpen(true)}>
              Rate Employer
            </button>
          </div>
        </section>
      )}

      {hasRated && workspace.status === "completed" && (
        <section
          className="wm-ee-card"
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 20,
            background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
            boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
            Rating submitted
          </div>

          <div
            style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 600 }}
          >
            Thank you for your feedback. This helps build trust for everyone.
          </div>
        </section>
      )}

      <ShiftWorkspaceExitSection
        workspace={workspace}
        readOnly={readOnly}
        onExited={() =>
          nav(
            isPlannerDomain
              ? ROUTE_PATHS.employeePlannerWorkspaces
              : ROUTE_PATHS.employeeShiftWorkspaces,
          )
        }
      />

      <WorkerRateEmployerModal
        isOpen={ratingOpen}
        jobId={workspace.postId}
        jobTitle={workspace.jobName}
        workerWmId={workerWmId}
        employerWmId={employerWmId}
        companyName={workspace.companyName}
        domain="shift"
        onSubmitted={handleRatingSubmitted}
        onClose={() => setRatingOpen(false)}
      />

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}

function getSafeExternalMapsUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  return undefined;
}
