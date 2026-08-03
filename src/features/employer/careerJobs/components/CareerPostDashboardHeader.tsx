// App name: Job Mitra | CareerPostDashboardHeader.tsx — DomainHero (full Career)

import { useSyncExternalStore } from "react";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type { CareerJobPost } from "../types/careerTypes";
import {
  CareerPostDashboardHeaderActions,
  CareerPostDashboardMetaPills,
} from "./CareerPostDashboardHeader.parts";
import {
  formatDisplayTitle,
  formatStatusLabel,
  getStatusStyle,
} from "./CareerPostDashboardHeader.styles";

function subscribeClock(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 30_000);
  return () => window.clearInterval(id);
}

function getClockMs() {
  return Date.now();
}

type CareerPostDashboardHeaderProps = {
  post: CareerJobPost;
  onAllPosts: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onRepost: () => void;
  onExpire: () => void;
  onExtendClosing: () => void;
  onDelete: () => void;
};

export function CareerPostDashboardHeader({
  post,
  onPause,
  onResume,
  onClose,
  onRepost,
  onExpire,
  onExtendClosing,
  onDelete,
}: CareerPostDashboardHeaderProps) {
  const nowMs = useSyncExternalStore(subscribeClock, getClockMs, getClockMs);
  const statusStyle = getStatusStyle(post.status);
  const locationSummary = [post.companyName, post.department, post.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Employer Career"
      title={formatDisplayTitle(post.jobTitle)}
      subtitle={locationSummary}
      description="Manage pipeline, pause or close this post, and review applicants."
      trailing={
        <span
          className={`wm-domainHeroBadge ${statusStyle.ring}`}
          style={{
            background: statusStyle.background,
            border: statusStyle.border,
            color: statusStyle.color,
          }}
        >
          {formatStatusLabel(post.status)}
        </span>
      }
    >
      <CareerPostDashboardMetaPills post={post} />
      <CareerPostDashboardHeaderActions
        post={post}
        nowMs={nowMs}
        onPause={onPause}
        onResume={onResume}
        onClose={onClose}
        onRepost={onRepost}
        onExpire={onExpire}
        onExtendClosing={onExtendClosing}
        onDelete={onDelete}
      />
    </DomainHero>
  );
}
