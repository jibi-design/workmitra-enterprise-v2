// App name: Job Mitra | CareerPostDashboardHeader.tsx — DomainHero (full Career)

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

type CareerPostDashboardHeaderProps = {
  post: CareerJobPost;
  onAllPosts: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onRepost: () => void;
};

export function CareerPostDashboardHeader({
  post,
  onPause,
  onResume,
  onClose,
  onRepost,
}: CareerPostDashboardHeaderProps) {
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
        onPause={onPause}
        onResume={onResume}
        onClose={onClose}
        onRepost={onRepost}
      />
    </DomainHero>
  );
}
