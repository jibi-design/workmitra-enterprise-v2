/** Job Mitra | buildEmployeePendingBannerQueue.ts | Merge home signals into one priority queue */

import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { DomainRegistryKey } from "../../../../shared/config/domainRegistry";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import { getProfileCompletion } from "../../profile/services/profileCompletionService";
import {
  getUpcomingShiftNudgeSnapshot,
  getUnifiedBroadcastNudgeSnapshot,
  nudgeDomainTitle,
  setHomeNudgeDemoForce,
} from "./employeeHomeDynamicNudges.helpers";
import type { PendingBannerAccent, PendingBannerQueueItem } from "./pendingBannerQueue.types";

function mapActionAccent(domain: string): PendingBannerAccent {
  if (domain === "shift") return "shift";
  if (domain === "career") return "career";
  if (domain === "planner") return "planner";
  if (domain === "vault" || domain === "employment") return "vault";
  return "shift";
}

function mapActionDomainLabel(domain: string): string {
  if (domain === "shift") return "Shift";
  if (domain === "career") return "Career";
  if (domain === "planner") return "Planner";
  if (domain === "vault" || domain === "employment") return "Vault";
  return "Action";
}

function fromPendingAction(item: PendingActionItem): PendingBannerQueueItem | null {
  if (item.count <= 0) return null;
  return {
    id: `action:${item.id}`,
    fingerprint: `action|${item.id}|${item.count}|${item.label}|${item.detail}`,
    accent: mapActionAccent(item.domain),
    domainLabel: mapActionDomainLabel(item.domain),
    title: item.label,
    detail: item.detail,
    count: item.count,
    ctaLabel: item.ctaLabel,
    onOpen: item.onAction,
    dualActions: item.dualActions,
  };
}

function fromUpcoming(nav: NavigateFunction): PendingBannerQueueItem | null {
  const snap = getUpcomingShiftNudgeSnapshot();
  if (snap.count <= 0) return null;

  const detail = snap.nearest
    ? `${snap.nearest.jobName} · ${snap.nearest.companyName}`
    : snap.isDemoForce
      ? "Warehouse Helper · Demo Corp"
      : `${snap.count} shift${snap.count === 1 ? "" : "s"} this week`;

  return {
    id: "nudge:upcoming-shifts",
    fingerprint: `upcoming|${snap.fingerprint}`,
    accent: "shift",
    domainLabel: "Shift",
    title: "Upcoming shifts",
    detail: `${snap.count} upcoming · ${detail}`,
    count: snap.count,
    ctaLabel: "Open",
    isDemoForce: snap.isDemoForce,
    demoKind: "upcoming",
    onOpen: () => {
      if (snap.isDemoForce) {
        setHomeNudgeDemoForce({ upcoming: false });
        return;
      }
      if (snap.nearest?.workspaceId) {
        nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", snap.nearest.workspaceId));
        return;
      }
      nav(ROUTE_PATHS.employeeShiftCenter);
    },
  };
}

function fromBroadcast(nav: NavigateFunction): PendingBannerQueueItem | null {
  const snap = getUnifiedBroadcastNudgeSnapshot();
  if (snap.totalUnread <= 0) return null;

  const accent = snap.accentDomain as DomainRegistryKey;
  return {
    id: "nudge:broadcast-alerts",
    fingerprint: `broadcast|${snap.fingerprint}`,
    accent,
    domainLabel: nudgeDomainTitle(accent).replace(/ Jobs$/i, "") || "Alerts",
    title: "Shift alerts",
    detail: snap.label,
    count: snap.totalUnread,
    ctaLabel: "Open",
    isDemoForce: snap.isDemoForce,
    demoKind: "broadcast",
    onOpen: () => {
      if (snap.isDemoForce) {
        setHomeNudgeDemoForce({ broadcastDomain: null });
        return;
      }
      if (snap.latest?.route) {
        nav(snap.latest.route);
        return;
      }
      if (snap.workspaceUnread > 0 && snap.notificationUnread === 0) {
        nav(ROUTE_PATHS.employeeShiftWorkspaces);
        return;
      }
      nav(ROUTE_PATHS.employeeNotifications);
    },
  };
}

function fromProfile(nav: NavigateFunction, forceVisible: boolean): PendingBannerQueueItem | null {
  const status = getProfileCompletion();
  if (status.isComplete && !forceVisible) return null;

  const percent =
    status.totalCount > 0 ? Math.round((status.doneCount / status.totalCount) * 100) : 0;

  return {
    id: "nudge:complete-profile",
    fingerprint: `profile|${status.doneCount}|${status.totalCount}|${status.isComplete ? 1 : 0}`,
    accent: "profile",
    domainLabel: "Profile",
    title: "Complete profile",
    detail: `${percent}%`,
    count: Math.max(1, status.totalCount - status.doneCount),
    ctaLabel: "Continue",
    onOpen: () => nav(ROUTE_PATHS.employeeProfile),
  };
}

/**
 * Priority: urgent/manual actions → upcoming shifts → alerts → profile.
 * Order is stable so dismiss advances to the next live item without skips.
 */
export function buildEmployeePendingBannerQueue(
  pendingActions: readonly PendingActionItem[],
  nav: NavigateFunction,
  forceVisible = false,
): PendingBannerQueueItem[] {
  const queue: PendingBannerQueueItem[] = [];

  for (const action of pendingActions) {
    const mapped = fromPendingAction(action);
    if (mapped) queue.push(mapped);
  }

  const upcoming = fromUpcoming(nav);
  if (upcoming) queue.push(upcoming);

  const broadcast = fromBroadcast(nav);
  if (broadcast) {
    // Prefer domain-accurate title for non-shift accents.
    if (broadcast.accent !== "shift") {
      broadcast.title = `${broadcast.domainLabel} alerts`;
    }
    queue.push(broadcast);
  }

  const profile = fromProfile(nav, forceVisible);
  if (profile) queue.push(profile);

  return queue;
}

export function pendingBannerAccentCssVar(accent: PendingBannerAccent): string {
  if (accent === "profile") return "var(--wm-pending-profile-accent, #b45309)";
  return `var(--wm-${accent}-accent)`;
}
