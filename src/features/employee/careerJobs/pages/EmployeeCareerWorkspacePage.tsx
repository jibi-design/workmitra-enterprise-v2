// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspacePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerWorkspacePage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackCompletedSnapshot,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import { RatingDisplayCard } from "../../../../shared/rating/components/RatingDisplayCard";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { CareerWorkspaceEmploymentSection } from "../components/CareerWorkspaceEmploymentSection";
import { InfoRow, UpdateCard } from "../components/CareerWorkspaceComponents";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../../employment/storage/employmentLifecycle.storage";
import {
  explanationBg,
  explanationBorder,
  fmtDateTime,
  isRatableStatus,
  statusExplanation,
  statusLabel,
  statusTone,
  toneBadgeStyle,
} from "../helpers/careerWorkspaceDisplayHelpers";
import {
  getCareerWorkspacesSnapshot,
  subscribeCareerWorkspaces,
} from "../helpers/careerWorkspaceHooks";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-emp-text, #111827)";
const CAREER_MUTED = "var(--wm-emp-muted, #6b7280)";

function parseCompletedFeedbackSnapshot(raw: string): CareerEmploymentFeedbackCompletedSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackCompletedSnapshot;
    return { task: parsed.task ?? null };
  } catch {
    return { task: null };
  }
}

function getLifecycleSnapshot(): string {
  return JSON.stringify(employmentLifecycleStorage.getAll());
}

function parseLifecycleRecord(careerPostId: string, raw: string): EmploymentRecord | null {
  try {
    const parsed = JSON.parse(raw) as EmploymentRecord[];
    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find((item) => item.careerPostId === careerPostId && item.status !== "exited") ??
      parsed.find((item) => item.careerPostId === careerPostId) ??
      null
    );
  } catch {
    return null;
  }
}

export function EmployeeCareerWorkspacePage() {
  const nav = useNavigate();
  const { workspaceId = "" } = useParams();
  const allWs = useSyncExternalStore(
    subscribeCareerWorkspaces,
    getCareerWorkspacesSnapshot,
    getCareerWorkspacesSnapshot,
  );
  const workspace = allWs.find((item) => item.id === workspaceId) ?? null;
  const careerPostId = workspace?.jobId ?? "";

  const lifecycleRaw = useSyncExternalStore(
    employmentLifecycleStorage.subscribe,
    getLifecycleSnapshot,
    getLifecycleSnapshot,
  );

  const employmentRecord = careerPostId ? parseLifecycleRecord(careerPostId, lifecycleRaw) : null;

  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
  );

  const completedFeedback = useMemo(
    () => parseCompletedFeedbackSnapshot(feedbackRaw).task,
    [feedbackRaw],
  );

  const [ratingOpen, setRatingOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const handleRatingSubmitted = useCallback(() => {
    setRatingOpen(false);
    setNotice({
      title: "Rating submitted",
      message: "Thank you for your feedback.",
      tone: "success",
    });
  }, [setRatingOpen, setNotice]);

  if (!workspace) {
    return (
      <div>
        <div className="wm-ee-card" style={{ marginTop: 12, textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 850, color: CAREER_TEXT }}>
            This workspace is not available.
          </div>
          <div style={{ fontSize: 12, color: CAREER_MUTED, marginTop: 6 }}>
            It may have been removed or not yet created.
          </div>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employeeCareerHome)}
            style={{ marginTop: 12, fontSize: 12 }}
          >
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
  const hasRated =
    workerWmId && employerWmId
      ? ratingStorage.hasWorkerRatedEmployer(workerWmId, workspace.jobId, employerWmId)
      : false;

  return (
    <div style={{ paddingBottom: 28 }}>
      <div
        className="wm-ee-card"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 28,
          border: "1px solid rgba(29,78,216,0.20)",
          background:
            "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.16), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(239,246,255,0.92))",
          boxShadow: "0 22px 48px rgba(15,23,42,0.11)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(29,78,216,0.09)",
                border: "1px solid rgba(29,78,216,0.14)",
                color: CAREER_BLUE_DEEP,
                fontSize: 10,
                fontWeight: 950,
                letterSpacing: 0.55,
                textTransform: "uppercase",
              }}
            >
              Employee Career Workspace
            </div>

            <span
              style={{
                height: 25,
                padding: "0 10px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                fontSize: 10.5,
                fontWeight: 900,
                ...toneBadgeStyle(tone),
              }}
            >
              {statusLabel(workspace.status)}
            </span>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 21,
              fontWeight: 1000,
              color: CAREER_TEXT,
              lineHeight: 1.15,
            }}
          >
            {workspace.jobTitle}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12.5,
              color: CAREER_MUTED,
              fontWeight: 760,
              lineHeight: 1.45,
            }}
          >
            {workspace.companyName}
            {workspace.department ? ` - ${workspace.department}` : ""}
            {workspace.location ? ` | ${workspace.location}` : ""}
          </div>

          <div style={{ marginTop: 10 }}>
            <EmployerTrustBadge variant="full" />
          </div>
        </div>
      </div>

      {explain && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 18,
            border: `1px solid ${explanationBorder(explain.tone)}`,
            background: explanationBg(explain.tone),
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: CAREER_TEXT }}>{explain.title}</div>
          <div style={{ fontSize: 12, color: CAREER_MUTED, marginTop: 4, lineHeight: 1.6 }}>
            {explain.body}
          </div>
        </div>
      )}

      {employmentRecord && (
        <button
          type="button"
          onClick={() =>
            nav(ROUTE_PATHS.employeeEmploymentDetail.replace(":employmentId", employmentRecord.id))
          }
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 50,
            borderRadius: 18,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 950,
            cursor: "pointer",
            boxShadow: "0 12px 28px rgba(37,99,235,0.24)",
          }}
        >
          Open Daily Tasks & Work Diary
        </button>
      )}

      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: CAREER_BLUE, marginBottom: 10 }}>
          Position details
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <InfoRow label="Job Title" value={workspace.jobTitle} />
          <InfoRow label="Company" value={workspace.companyName} />
          <InfoRow label="Department" value={workspace.department} />
          <InfoRow label="Location" value={workspace.location} />
          <InfoRow
            label="Hired On"
            value={workspace.hiredAt ? fmtDateTime(workspace.hiredAt) : ""}
          />
        </div>
      </div>

      {completedFeedback?.selectedTags && completedFeedback.selectedTags.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <WorkFeedbackSummaryCard
            tags={completedFeedback.selectedTags}
            companyName={completedFeedback.companyName}
            jobTitle={completedFeedback.jobTitle}
            displayMode="protectedRecord"
            subtitle="Protected feedback from this completed Career employment record."
          />
        </div>
      )}

      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: CAREER_BLUE, marginBottom: 10 }}>
          Updates ({workspace.updates.length})
        </div>

        {workspace.updates.length === 0 ? (
          <div style={{ fontSize: 12, color: CAREER_MUTED }}>
            No updates yet. Employer communications will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {workspace.updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        )}
      </div>

      <CareerWorkspaceEmploymentSection
        careerPostId={workspace.jobId}
        companyName={workspace.companyName}
        onNotice={setNotice}
      />

      {canRate && !hasRated && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: CAREER_TEXT }}>Rate employer</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: CAREER_MUTED,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Share your experience. Your rating helps other workers choose good employers.
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={() => setRatingOpen(true)}
              style={{ background: CAREER_BLUE }}
            >
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

      <WorkerRateEmployerModal
        isOpen={ratingOpen}
        jobId={workspace.jobId}
        jobTitle={workspace.jobTitle}
        workerWmId={workerWmId}
        employerWmId={employerWmId}
        companyName={workspace.companyName}
        domain="career"
        onSubmitted={handleRatingSubmitted}
        onClose={() => setRatingOpen(false)}
      />

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
