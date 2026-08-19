import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { ShiftApplicationStatusTimeline } from "./ShiftApplicationStatusTimeline";
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
import {
  getNextStepText,
  getShiftApplicationPulseTarget,
  GREEN,
  MUTED,
  TEXT_DARK,
} from "./myShiftApplicationsList.helpers";

type MyShiftApplicationCardProps = {
  application: ShiftApplicationData;
  post?: ShiftPostData;
  isPulseActive?: boolean;
  onTap: () => void;
  onFindShifts: () => void;
  onWithdraw: () => void;
  onConfirmAttendance: () => void;
};

export function MyShiftApplicationCard({
  application,
  post,
  isPulseActive = false,
  onTap,
  onFindShifts,
  onWithdraw,
  onConfirmAttendance,
}: MyShiftApplicationCardProps) {
  const statusStyle = getStatusStyle(application.status);
  const title = post ? post.jobName : `Shift ${application.postId.slice(0, 8)}`;

  const employerName = post?.companyName?.trim() || "Employer not specified";
  const typeText = post?.shiftType ?? "";
  const dateText = post ? fmtDateRange(post.startAt, post.endAt) : "";
  const payText = post ? formatPay(post.payPerDay) : "";
  const nextStep = getNextStepText(application);
  const canWithdraw =
    isWithdrawableStatus(application.status) || application.status === "confirmed";
  const needsAttendanceConfirmation =
    application.status === "confirmed" && application.attendanceConfirmedAt === undefined;
  const isDirectInviteAccepted = isDirectInviteAcceptedApplication(application.id);
  const pulseTarget = getShiftApplicationPulseTarget(application);

  const card = (
    <article
      aria-label={`${title} application status ${statusLabel(application.status)}`}
      className="wm-shift-card wm-shift-pressable"
      data-testid={`shift-application-card-${application.id}`}
      style={{
        position: "relative",
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderLeft: isPulseActive ? undefined : `4px solid ${GREEN}`,
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
              fontWeight: 800,
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
            fontWeight: 800,
            padding: "6px 10px",
            borderRadius: "var(--wm-radius-pill)",
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
        className="wm-shift-surface-glass wm-shift-surface-glass--shift"
        style={{
          padding: "9px 10px",
          color: GREEN,
          fontSize: 12,
          fontWeight: 700,
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
    <PulseTargetCard pulseId={pulseTarget.pulseId} edgeMode="full" radius="20px">
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
    <div className="wm-shift-surface-glass" style={{ padding: "9px", minWidth: 0 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
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
          fontWeight: 800,
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
