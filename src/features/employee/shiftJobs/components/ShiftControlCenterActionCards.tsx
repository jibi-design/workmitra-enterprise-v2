// App name: Job Mitra
// File name: ShiftControlCenterActionCards.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftControlCenterActionCards.tsx

import type { CSSProperties, ReactNode } from "react";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { ShiftControlCenterCounts } from "../types/shiftControlCenter.types";
import {
  ShiftBriefcaseIcon,
  ShiftClipboardIcon,
  ShiftMoneyIcon,
  ShiftReviewIcon,
  ShiftSearchIcon,
} from "./ShiftControlCenterIcons";

const SHIFT_GREEN = "#16a34a";
const RATING_ACCENT = "var(--wm-rating-accent, #d97706)";

const iconWrapStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, rgba(22,163,74,0.14), rgba(22,163,74,0.06))",
  color: SHIFT_GREEN,
  flexShrink: 0,
  boxShadow: "inset 0 0 0 1px rgba(22,163,74,0.12)",
};

const reviewIconWrapStyle: CSSProperties = {
  ...iconWrapStyle,
  background: "linear-gradient(180deg, rgba(217,119,6,0.14), rgba(217,119,6,0.06))",
  color: RATING_ACCENT,
  boxShadow: "inset 0 0 0 1px rgba(217,119,6,0.14)",
};

const actionCardStyle: CSSProperties = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 18,
  border: "1px solid rgba(226,232,240,0.95)",
  borderLeft: `4px solid ${SHIFT_GREEN}`,
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
  transition:
    "opacity 500ms ease, filter 500ms ease, transform 300ms ease-out, box-shadow 300ms ease-out, border-color 300ms ease-out",
};

type ShiftControlCenterActionCardsProps = {
  counts: ShiftControlCenterCounts;
  shiftReviewPendingCount: number;
  weeklyEarnings?: number;
  onOpenSearch: () => void;
  onOpenApplications: () => void;
  onOpenEarnings: () => void;
  onOpenWorkspaces: () => void;
  onOpenReviews: () => void;
};

export function ShiftControlCenterActionCards({
  counts,
  shiftReviewPendingCount,
  weeklyEarnings = 0,
  onOpenSearch,
  onOpenApplications,
  onOpenEarnings,
  onOpenWorkspaces,
  onOpenReviews,
}: ShiftControlCenterActionCardsProps) {
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);
  const findShiftsPulseActive = activePulseNodeId === "shift-dashboard-find-shifts";
  const appsPulseActive = activePulseNodeId === "shift-dashboard-applications";
  const earningsPulseActive = activePulseNodeId === "shift-dashboard-earnings";
  const workspacesPulseActive = activePulseNodeId === "shift-dashboard-workspaces";

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
      <PulseTargetCard pulseId="shift-dashboard-find-shifts" radius="18px">
        <ActionCard
          title="Find Shifts"
          subtitle="Search and apply for available shifts"
          icon={<ShiftSearchIcon />}
          meta={
            counts.availableShifts > 0
              ? `${counts.availableShifts} shift${counts.availableShifts !== 1 ? "s" : ""} available`
              : "Browse open shift posts"
          }
          isPulseActive={findShiftsPulseActive}
          onClick={onOpenSearch}
        />
      </PulseTargetCard>

      <PulseTargetCard pulseId="shift-dashboard-applications" radius="18px">
        <ActionCard
          title="My Applications"
          subtitle="Track your shift applications"
          icon={<ShiftClipboardIcon />}
          meta={getApplicationsMeta(counts)}
          isPulseActive={appsPulseActive}
          onClick={onOpenApplications}
        />
      </PulseTargetCard>

      <PulseTargetCard pulseId="shift-dashboard-earnings" radius="18px">
        <ActionCard
          title="My Earnings"
          subtitle="Track your shift earnings"
          icon={<ShiftMoneyIcon />}
          meta={formatWeeklyEarnings(weeklyEarnings)}
          isPulseActive={earningsPulseActive}
          onClick={onOpenEarnings}
        />
      </PulseTargetCard>

      <PulseTargetCard pulseId="shift-dashboard-workspaces" radius="18px">
        <ActionCard
          title="My Workspaces"
          subtitle="Active shift groups and updates"
          icon={<ShiftBriefcaseIcon />}
          meta={
            counts.activeWs > 0
              ? `${counts.activeWs} active workspace${counts.activeWs !== 1 ? "s" : ""}`
              : "No active workspace now"
          }
          isPulseActive={workspacesPulseActive}
          onClick={onOpenWorkspaces}
        />
      </PulseTargetCard>

      <ActionCard
        title="Reviews"
        subtitle="Ratings and feedback history"
        icon={<ShiftReviewIcon />}
        iconWrapStyle={reviewIconWrapStyle}
        meta={
          shiftReviewPendingCount > 0
            ? `${shiftReviewPendingCount} review${shiftReviewPendingCount !== 1 ? "s" : ""} pending`
            : "Open Review Center"
        }
        metaColor={shiftReviewPendingCount > 0 ? RATING_ACCENT : "var(--wm-er-muted)"}
        testId="shift-employee-reviews-card"
        onClick={onOpenReviews}
      />
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  meta,
  isPulseActive = false,
  iconWrapStyle: customIconWrapStyle,
  metaColor,
  testId,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  meta: string;
  isPulseActive?: boolean;
  iconWrapStyle?: CSSProperties;
  metaColor?: string;
  testId?: string;
  onClick: () => void;
}) {
  const cardStyle: CSSProperties = {
    ...actionCardStyle,
    borderLeft: isPulseActive ? "1px solid rgba(226,232,240,0.95)" : actionCardStyle.borderLeft,
  };

  return (
    <button
      type="button"
      className="wm-press-card"
      style={cardStyle}
      onClick={onClick}
      data-testid={testId}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={customIconWrapStyle ?? iconWrapStyle}>{icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)" }}>{title}</div>

          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{subtitle}</div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: metaColor ?? getMetaColor(title),
              marginTop: 5,
            }}
          >
            {meta}
          </div>
        </div>

        <span style={{ fontSize: 18, color: "var(--wm-er-muted)", flexShrink: 0 }}>›</span>
      </div>
    </button>
  );
}

function getApplicationsMeta(counts: ShiftControlCenterCounts): string {
  if (counts.totalApps === 0) return "No applications yet";

  if (counts.pending > 0 && counts.confirmed > 0) {
    return `${counts.pending} pending - ${counts.confirmed} confirmed`;
  }

  if (counts.pending > 0) return `${counts.pending} pending`;
  if (counts.confirmed > 0) return `${counts.confirmed} confirmed`;

  return `${counts.totalApps} total`;
}

function formatWeeklyEarnings(value: number): string {
  const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
  const formatted = safeValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} earned this week`;
}

function getMetaColor(title: string): string {
  if (title === "My Earnings") {
    return "var(--wm-er-muted)";
  }

  return SHIFT_GREEN;
}
