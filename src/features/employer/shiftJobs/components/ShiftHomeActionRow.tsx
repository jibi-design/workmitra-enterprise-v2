// App name: Job Mitra
// File name: ShiftHomeActionRow.tsx
// Native-style segmented quick actions with micro-icons + active state

import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { PulseNode } from "../../../pulse/PulseNode";
import { IconFavorites, IconGroup, IconPost } from "./ShiftHomeIcons";
import { ActionPill } from "../../../../shared/components/layout/designDna";

type ShiftHomeActionRowProps = {
  postsCount: number;
  activeShiftsCount: number;
  groups: number;
  favCount: number;
  onPosts: () => void;
  onGroups: () => void;
  onFavorites: () => void;
};

export function ShiftHomeActionRow({
  postsCount,
  activeShiftsCount,
  groups,
  favCount,
  onPosts,
  onGroups,
  onFavorites,
}: ShiftHomeActionRowProps) {
  const { pathname } = useLocation();

  const postsActive =
    pathname.startsWith(ROUTE_PATHS.employerShiftPosts) ||
    pathname.includes("/employer/shift/post/");
  const groupsActive = pathname.startsWith(ROUTE_PATHS.employerShiftWorkspaces);
  const favoritesActive = pathname.startsWith(ROUTE_PATHS.employerShiftFavorites);

  return (
    <nav
      className="wm-shiftHomeQuickBar"
      aria-label="Workspace quick actions"
      data-testid="shift-home-action-row"
    >
      <PulseNode
        id="shift-dashboard-applications"
        variant="button"
        style={{ "--wm-pulse-node-radius": "999px", width: "100%" }}
      >
        <QuickAction
          label="My Posts / Active Shifts"
          icon={<IconPost />}
          badge={postsCount > 0 ? String(postsCount) : undefined}
          meta={activeShiftsCount > 0 ? `${activeShiftsCount} active` : undefined}
          active={postsActive}
          onClick={onPosts}
          testId="shift-home-quick-posts"
        />
      </PulseNode>
      <QuickAction
        label="Work Groups"
        icon={<IconGroup />}
        badge={groups > 0 ? String(groups) : undefined}
        active={groupsActive}
        onClick={onGroups}
        testId="shift-home-quick-groups"
      />
      <QuickAction
        label="Saved Favorites"
        icon={<IconFavorites />}
        badge={favCount > 0 ? String(favCount) : undefined}
        active={favoritesActive}
        onClick={onFavorites}
        testId="shift-home-quick-favorites"
      />
    </nav>
  );
}

function QuickAction({
  label,
  icon,
  badge,
  meta,
  active,
  onClick,
  testId,
}: {
  label: string;
  icon: ReactNode;
  badge?: string;
  meta?: string;
  active?: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <ActionPill
      bare
      domain="shift"
      active={active}
      className={["wm-shiftHomeQuickPill", active ? "isActive" : ""].filter(Boolean).join(" ")}
      onClick={onClick}
      data-testid={testId}
      aria-current={active ? "page" : undefined}
    >
      <span className="wm-shiftHomeQuickPillIcon" aria-hidden="true">
        {icon}
      </span>
      <span className="wm-shiftHomeQuickPillLabel">{label}</span>
      {badge ? <span className="wm-shiftHomeQuickPillBadge">{badge}</span> : null}
      {meta ? <span className="wm-shiftHomeQuickPillMeta">{meta}</span> : null}
    </ActionPill>
  );
}
