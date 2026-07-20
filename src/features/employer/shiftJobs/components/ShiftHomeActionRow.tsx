// App name: Job Mitra
// File name: ShiftHomeActionRow.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeActionRow.tsx

import type { CSSProperties, ReactNode } from "react";
import { IconBroadcast, IconFavorites, IconGroup, IconPost, IconReview } from "./ShiftHomeIcons";
import { shiftHomeActionButtonBase, shiftHomeActionIconWrap } from "./ShiftHomeSectionStyles";

type ShiftHomeActionRowProps = {
  groups: number;
  favCount: number;
  reviewPendingCount: number;
  onPosts: () => void;
  onGroups: () => void;
  onBroadcasts: () => void;
  onFavorites: () => void;
  onReviews: () => void;
};

const ACTION_GRID_STYLE: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

const ACTION_BUTTON_STYLE: CSSProperties = {
  ...shiftHomeActionButtonBase,
  minHeight: 112,
  justifyContent: "flex-start",
  paddingTop: 14,
  paddingBottom: 12,
};

const LABEL_STYLE: CSSProperties = {
  lineHeight: 1.15,
  fontSize: 12,
  fontWeight: 900,
  textAlign: "center",
};

const DESCRIPTION_STYLE: CSSProperties = {
  minHeight: 14,
  fontSize: 10,
  lineHeight: 1.25,
  color: "var(--wm-er-muted)",
  textAlign: "center",
  fontWeight: 700,
};

const META_STYLE: CSSProperties = {
  minHeight: 12,
  fontSize: 10,
  color: "var(--wm-er-accent-shift, #16a34a)",
  lineHeight: 1.1,
  fontWeight: 900,
  textAlign: "center",
};

export function ShiftHomeActionRow({
  groups,
  favCount,
  reviewPendingCount,
  onPosts,
  onGroups,
  onBroadcasts,
  onFavorites,
  onReviews,
}: ShiftHomeActionRowProps) {
  return (
    <div style={ACTION_GRID_STYLE} data-testid="shift-home-action-row">
      <ActionButton label="My Posts" description="Created shifts" onClick={onPosts}>
        <IconPost />
      </ActionButton>

      <ActionButton
        label="Groups"
        description="Confirmed teams"
        subLabel={groups > 0 ? `${groups} active` : undefined}
        onClick={onGroups}
      >
        <IconGroup />
      </ActionButton>

      <ActionButton
        label="Favorites"
        description="Trusted workers"
        subLabel={favCount > 0 ? `${favCount} saved` : undefined}
        onClick={onFavorites}
        iconStyle={{
          background: "rgba(22,163,74,0.08)",
          color: "var(--wm-er-accent-shift, #16a34a)",
        }}
      >
        <IconFavorites />
      </ActionButton>

      <ActionButton label="Broadcasts" description="Worker updates" onClick={onBroadcasts}>
        <IconBroadcast />
      </ActionButton>

      <ActionButton
        label="Reviews"
        description="Ratings & feedback"
        subLabel={reviewPendingCount > 0 ? `${reviewPendingCount} pending` : undefined}
        onClick={onReviews}
        testId="shift-home-reviews-tile"
        iconStyle={{
          background: "rgba(217,119,6,0.1)",
          color: "var(--wm-rating-accent, #d97706)",
        }}
      >
        <IconReview />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  description,
  subLabel,
  onClick,
  iconStyle,
  testId,
  children,
}: {
  label: string;
  description: string;
  subLabel?: string;
  onClick: () => void;
  iconStyle?: CSSProperties;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" style={ACTION_BUTTON_STYLE} onClick={onClick} data-testid={testId}>
      <div style={{ ...shiftHomeActionIconWrap, ...iconStyle }}>{children}</div>
      <span style={LABEL_STYLE}>{label}</span>
      <span style={DESCRIPTION_STYLE}>{description}</span>
      {subLabel ? <span style={META_STYLE}>{subLabel}</span> : null}
    </button>
  );
}
