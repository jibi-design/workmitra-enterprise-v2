// App name: Job Mitra
// File name: ShiftControlCenterActionCards.tsx
// Shift Jobs Home — discovery actions (Find + Applications); layout via CSS lock

import type { ReactNode } from "react";
import { motion } from "framer-motion";
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

  return (
    <div className="wm-shiftEmployeeActionGrid" data-testid="shift-jobs-action-cards">
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
    <motion.button
      type="button"
      className={[
        "wm-shift-pressable",
        "wm-shiftJobsPrimaryCard",
        isPulseActive ? "isPulseActive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
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
    </motion.button>
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
