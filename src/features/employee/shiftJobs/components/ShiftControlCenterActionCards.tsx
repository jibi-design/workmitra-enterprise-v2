// App name: Job Mitra
// File name: ShiftControlCenterActionCards.tsx
// Shift Jobs Home — discovery actions; Wave 2 DNA press + persistent active

import type { ReactNode } from "react";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { ShiftControlCenterCounts } from "../types/shiftControlCenter.types";
import { ShiftClipboardIcon, ShiftSearchIcon } from "./ShiftControlCenterIcons";

type ShiftControlCenterActionCardsProps = {
  counts: ShiftControlCenterCounts;
  onOpenSearch: () => void;
  onOpenApplications: () => void;
};

const PRIMARY_CARD_RADIUS = "var(--wm-radius-employee-card)";

export function ShiftControlCenterActionCards({
  counts,
  onOpenSearch,
  onOpenApplications,
}: ShiftControlCenterActionCardsProps) {
  const activePulseNodeId = usePulseStore((state) => state.chain[0] ?? null);
  const findShiftsPulseActive = activePulseNodeId === "shift-dashboard-find-shifts";
  const appsPulseActive = activePulseNodeId === "shift-dashboard-applications";

  const appsFirst = counts.pending > 0 || counts.confirmed > 0;
  const findCard = (
      <PulseTargetCard pulseId="shift-dashboard-find-shifts" radius={PRIMARY_CARD_RADIUS}>
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
  );
  const appsCard = (
      <PulseTargetCard pulseId="shift-dashboard-applications" radius={PRIMARY_CARD_RADIUS}>
        <ActionCard
          title="My Applications"
          subtitle="Track your shift applications"
          icon={<ShiftClipboardIcon />}
          meta={getApplicationsMeta(counts)}
          isPulseActive={appsPulseActive}
          onClick={onOpenApplications}
        />
      </PulseTargetCard>
  );

  return (
    <div className="wm-shiftEmployeeActionGrid" data-testid="shift-jobs-action-cards">
      {appsFirst ? (
        <>
          {appsCard}
          {findCard}
        </>
      ) : (
        <>
          {findCard}
          {appsCard}
        </>
      )}
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  meta,
  isPulseActive = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  meta: string;
  isPulseActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "wm-press-card",
        "wm-shift-pressable",
        "wm-shiftJobsPrimaryCard",
        "wm-homeGlassCard--domainShift",
        isPulseActive ? "isPulseActive is-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-current={isPulseActive ? "page" : undefined}
      aria-label={`${title}. ${subtitle}. ${meta}`}
    >
      <div className="wm-shiftJobsPrimaryCardInner">
        <div className="wm-shiftJobsPrimaryCardIcon" aria-hidden="true">
          {icon}
        </div>

        <div className="wm-shiftJobsPrimaryCardBody">
          <div className="wm-shiftJobsPrimaryCardTitle">{title}</div>
          <div className="wm-shiftJobsPrimaryCardSubtitle">{subtitle}</div>
          <div className="wm-shiftJobsPrimaryCardMeta">{meta}</div>
        </div>

        <span className="wm-shiftJobsPrimaryCardArrow" aria-hidden="true">
          ›
        </span>
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
