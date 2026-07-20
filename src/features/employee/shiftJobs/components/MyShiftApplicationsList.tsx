// App name: Job Mitra
// File name: MyShiftApplicationsList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftApplicationsList.tsx

import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { usePulseStore, type PulseNodeId } from "../../../pulse/pulseStore";
import { ShiftApplicationStatusTimeline } from "./ShiftApplicationStatusTimeline";
import { PlannerMyWorkPlanBundle } from "../../planner/components/PlannerMyWorkPlanBundle";
import { groupApplicationsForMyWork } from "../../planner/helpers/plannerApplicationBundles";
import type {
  ShiftApplicationData,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import { isDirectInviteAcceptedApplication } from "../helpers/shiftDirectInvite.helpers";
import {
  fmtDateRange,
  fmtTimestamp,
  formatPay,
  getStatusStyle,
  isWithdrawableStatus,
  statusLabel,
} from "../../shiftJobs/helpers/shiftApplicationHelpers";

const GREEN = "#16a34a";
const PLANNER_TEAL = "#0891b2";
const TEXT_DARK = "#0f172a";
const MUTED = "#64748b";

type ShiftApplicationPulseTarget = {
  readonly pulseId: PulseNodeId;
};

type MyShiftApplicationsListProps = {
  domain?: "shift" | "planner";
  applications: ShiftApplicationData[];
  postMap: Map<string, ShiftPostData>;
  onFindShifts: () => void;
  onOpenApplication: (application: ShiftApplicationData) => void;
  onWithdrawApplication: (application: ShiftApplicationData) => void;
  onConfirmAttendanceApplication: (application: ShiftApplicationData) => void;
};

export function MyShiftApplicationsList({
  domain = "shift",
  applications,
  postMap,
  onFindShifts,
  onOpenApplication,
  onWithdrawApplication,
  onConfirmAttendanceApplication,
}: MyShiftApplicationsListProps) {
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);

  if (applications.length === 0) {
    return <MyShiftApplicationsEmptyState domain={domain} onFindShifts={onFindShifts} />;
  }

  const entries = groupApplicationsForMyWork(applications).filter((entry) =>
    domain === "planner" ? entry.kind === "plan" : entry.kind === "single",
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section
        style={{
          padding: "10px 12px",
          borderRadius: 16,
          border:
            domain === "planner"
              ? "1px solid rgba(8,145,178,0.18)"
              : "1px solid rgba(22,163,74,0.14)",
          background:
            domain === "planner"
              ? "linear-gradient(180deg, rgba(236,254,255,0.72), rgba(255,255,255,0.98))"
              : "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.98))",
          color: MUTED,
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1.45,
        }}
      >
        {domain === "planner"
          ? "Track multi-day project bundles — per-day status and plan breakdown live here."
          : "Track employer review, shortlist, backup-list, confirmation, and closed status here. Open an application to review the shift again."}
      </section>

      {entries.map((entry) => {
        if (entry.kind === "plan") {
          return (
            <div key={entry.planApplyBatchId} className="wm-ee-vPlanner wm-planner-page">
              <PlannerMyWorkPlanBundle
                planId={entry.planId}
                applications={entry.applications}
                postMap={postMap}
                onOpenApplication={onOpenApplication}
              />
            </div>
          );
        }

        const application = entry.application;
        const pulseTarget = getShiftApplicationPulseTarget(application);
        const isPulseActive = Boolean(pulseTarget && pulseTarget.pulseId === activePulseNodeId);

        return (
          <MyShiftApplicationCard
            key={application.id}
            application={application}
            post={postMap.get(application.postId)}
            isPulseActive={isPulseActive}
            onTap={() => onOpenApplication(application)}
            onFindShifts={onFindShifts}
            onWithdraw={() => onWithdrawApplication(application)}
            onConfirmAttendance={() => onConfirmAttendanceApplication(application)}
          />
        );
      })}
    </div>
  );
}

function MyShiftApplicationsEmptyState({
  domain = "shift",
  onFindShifts,
}: {
  domain?: "shift" | "planner";
  onFindShifts: () => void;
}) {
  const isPlanner = domain === "planner";
  const accent = isPlanner ? PLANNER_TEAL : GREEN;

  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 12,
        padding: "34px 18px",
        borderRadius: 24,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 22,
          background: isPlanner
            ? "linear-gradient(180deg, rgba(8,145,178,0.14), rgba(8,145,178,0.06))"
            : "linear-gradient(180deg, rgba(22,163,74,0.14), rgba(22,163,74,0.06))",
          border: isPlanner ? "1px solid rgba(8,145,178,0.18)" : "1px solid rgba(22,163,74,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z"
          />
        </svg>
      </div>

      <div style={{ fontSize: 16, fontWeight: 950, color: TEXT_DARK }}>No applications yet</div>

      <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, maxWidth: 290 }}>
        {isPlanner
          ? "Browse Gig Projects and apply to multi-day plans to track bundle status here."
          : "Find shifts and apply to start tracking employer review and updates here."}
      </div>

      <button
        type="button"
        onClick={onFindShifts}
        className={isPlanner ? "wm-planner-btnPrimary" : undefined}
        style={
          isPlanner
            ? {
                marginTop: 4,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 950,
                cursor: "pointer",
              }
            : {
                marginTop: 4,
                background: GREEN,
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 950,
                cursor: "pointer",
                boxShadow: "0 10px 22px rgba(22,163,74,0.18)",
              }
        }
      >
        {isPlanner ? "Browse Projects" : "Find Shifts"}
      </button>
    </section>
  );
}

function MyShiftApplicationCard({
  application,
  post,
  isPulseActive = false,
  onTap,
  onFindShifts,
  onWithdraw,
  onConfirmAttendance,
}: {
  application: ShiftApplicationData;
  post?: ShiftPostData;
  isPulseActive?: boolean;
  onTap: () => void;
  onFindShifts: () => void;
  onWithdraw: () => void;
  onConfirmAttendance: () => void;
}) {
  const statusStyle = getStatusStyle(application.status);
  const title = post ? post.jobName : `Shift ${application.postId.slice(0, 8)}`;

  const employerName = post?.companyName?.trim() || "Employer not specified";
  const typeText = post?.shiftType ?? "";
  const dateText = post ? fmtDateRange(post.startAt, post.endAt) : "";
  const payText = post ? formatPay(post.payPerDay) : "";
  const nextStep = getNextStepText(application);
  const canWithdraw = isWithdrawableStatus(application.status);
  const needsAttendanceConfirmation =
    application.status === "confirmed" && application.attendanceConfirmedAt === undefined;
  const isDirectInviteAccepted = isDirectInviteAcceptedApplication(application.id);
  const pulseTarget = getShiftApplicationPulseTarget(application);

  const card = (
    <article
      aria-label={`${title} application status ${statusLabel(application.status)}`}
      style={{
        position: "relative",
        width: "100%",
        textAlign: "left",
        padding: 15,
        borderRadius: 24,
        border: "1px solid rgba(148,163,184,0.22)",
        borderLeft: isPulseActive ? "1px solid rgba(148,163,184,0.22)" : `5px solid ${GREEN}`,
        background:
          "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.99) 48%, rgba(240,253,244,0.62))",
        boxShadow: "0 18px 42px rgba(15,23,42,0.095)",
        display: "grid",
        gap: 12,
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 950,
              color: TEXT_DARK,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              fontWeight: 800,
              color: MUTED,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employerName}
          </div>

          {isDirectInviteAccepted ? (
            <div
              className="wm-shiftDirectInviteVipBadge"
              data-testid="shift-direct-invite-vip-badge"
            >
              ⚡ Direct Invite Accepted
            </div>
          ) : null}
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 950,
            padding: "6px 10px",
            borderRadius: 999,
            background: statusStyle.badgeBg,
            color: statusStyle.color,
            flexShrink: 0,
            border: "1px solid rgba(148,163,184,0.16)",
          }}
        >
          {statusLabel(application.status)}
        </span>
      </div>

      <div
        style={{
          padding: "9px 10px",
          borderRadius: 14,
          background: "rgba(22,163,74,0.07)",
          border: "1px solid rgba(22,163,74,0.14)",
          color: GREEN,
          fontSize: 12,
          fontWeight: 850,
          lineHeight: 1.4,
        }}
      >
        {nextStep}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        <MiniInfo label="Shift" value={typeText || "Shift details"} />
        <MiniInfo label="Pay" value={payText || "Not set"} highlight />
        <MiniInfo label="Date" value={dateText || "Not set"} />
        <MiniInfo label="Applied" value={fmtTimestamp(application.createdAt)} />
      </div>

      <ShiftApplicationStatusTimeline
        status={application.status}
        shiftTitle={title}
        employerName={employerName}
        locationName={post?.locationName}
        startAt={post?.startAt}
        endAt={post?.endAt}
        replacementReason={application.replacedReason}
        attendanceConfirmedAt={application.attendanceConfirmedAt}
        onOpenDetails={onTap}
        onOpenWorkspace={application.status === "confirmed" ? onTap : undefined}
        onWithdraw={canWithdraw ? onWithdraw : undefined}
        onConfirmAttendance={needsAttendanceConfirmation ? onConfirmAttendance : undefined}
        onFindMoreShifts={onFindShifts}
        onViewReplacementReason={application.status === "replaced" ? onTap : undefined}
      />
    </article>
  );

  if (!pulseTarget) {
    return card;
  }

  return (
    <PulseTargetCard pulseId={pulseTarget.pulseId} edgeMode="full" radius="24px">
      {card}
    </PulseTargetCard>
  );
}

function MiniInfo({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "9px 9px",
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.96))",
        border: "1px solid rgba(203,213,225,0.85)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 950,
          color: highlight ? GREEN : TEXT_DARK,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getNextStepText(application: ShiftApplicationData): string {
  if (application.status === "applied") return "Waiting for employer review.";
  if (application.status === "shortlisted")
    return "You are shortlisted. Keep your availability open until confirmation.";
  if (application.status === "waiting")
    return "You are on the backup list. Stay ready, but keep applying to other suitable shifts.";

  if (application.status === "confirmed") {
    if (isDirectInviteAcceptedApplication(application.id)) {
      return "Direct invite accepted. You are confirmed — open your workspace for updates.";
    }

    if (application.attendanceConfirmedAt !== undefined) {
      return "Attendance confirmed. Check your shift workspace and attend on time.";
    }

    return "Confirmed. Please confirm that you will attend this shift.";
  }

  if (application.status === "withdrawn") return "Application withdrawn.";
  if (application.status === "rejected")
    return "Not selected for this shift. You can apply for other available shifts.";
  if (application.status === "replaced") return "This assignment was replaced by the employer.";
  if (application.status === "exited") return "You exited this shift workspace.";
  return "Application status updated.";
}

function getShiftApplicationPulseTarget(
  application: ShiftApplicationData,
): ShiftApplicationPulseTarget | null {
  if (application.status === "shortlisted") {
    return {
      pulseId: "employee-shift-shortlisted-card",
    };
  }

  if (application.status === "waiting") {
    return {
      pulseId: "employee-shift-waitlisted-card",
    };
  }

  if (application.status === "confirmed" && application.attendanceConfirmedAt === undefined) {
    return {
      pulseId: "employee-shift-confirmation-card",
    };
  }

  return null;
}
