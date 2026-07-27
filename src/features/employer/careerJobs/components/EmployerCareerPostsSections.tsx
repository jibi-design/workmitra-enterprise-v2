// App name: Job Mitra
// File name: EmployerCareerPostsSections.tsx
// Ultra-Enterprise U1/U4 — StatusBadge + EnterpriseEmpty

import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import {
  EnterpriseEmpty,
  EnterpriseResponsiveGrid,
} from "../../../../shared/components/enterprise";
import { CareerPostStatusBadge } from "./CareerPostStatusBadge";
import { formatPostDate } from "../helpers/employerCareerPostList.helpers";
import {
  POSTS_CARD_META_STYLE,
  POSTS_CARD_STYLE,
  POSTS_CARD_TITLE_STYLE,
  POSTS_EMPTY_GUIDE_STYLE,
  POSTS_EMPTY_GUIDE_TEXT_STYLE,
  POSTS_EMPTY_GUIDE_TITLE_STYLE,
  POSTS_FOOTER_STYLE,
  POSTS_STAT_LABEL_STYLE,
  POSTS_STAT_STYLE,
  POSTS_STAT_VALUE_STYLE,
} from "../helpers/employerCareerPostsPage.styles";
import type { CareerJobPost } from "../types/careerTypes";

export function CareerPostsEmptyState({
  hasAnyPosts,
  onCreate,
}: {
  hasAnyPosts: boolean;
  onCreate: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <EnterpriseEmpty
        domain="career"
        title={hasAnyPosts ? "No posts match this filter" : "No Career posts yet"}
        subtitle={
          hasAnyPosts
            ? "Try a different search term or status filter to find the post you need."
            : "Create your first Career Job to start long-term hiring. Active posts appear first."
        }
        primaryLabel={hasAnyPosts ? undefined : "Create Career Job"}
        onPrimary={hasAnyPosts ? undefined : onCreate}
        secondaryLabel={hasAnyPosts ? "Clear filters by creating a post" : undefined}
        onSecondary={hasAnyPosts ? onCreate : undefined}
        testId="career-posts-empty"
      />
      <div style={POSTS_EMPTY_GUIDE_STYLE}>
        <div style={POSTS_EMPTY_GUIDE_TITLE_STYLE}>How this page works</div>
        <div style={POSTS_EMPTY_GUIDE_TEXT_STYLE}>
          Use this page as the employer’s full post list. Keep the Career Home clean, and open posts
          here when you need details, applicants, or future reuse.
        </div>
      </div>
    </div>
  );
}

export function EmployerCareerPostCard({
  post,
  onOpen,
}: {
  post: CareerJobPost;
  onOpen: () => void;
}) {
  return (
    <div
      className="wm-career-card wm-career-card--employer wm-hover-card wm-press-card"
      style={POSTS_CARD_STYLE}
    >
      <PulseTargetIndicator notificationId="APPLICATION_RECEIVED" postId={post.id} />

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open dashboard for ${post.jobTitle}`}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={POSTS_CARD_TITLE_STYLE}>{post.jobTitle}</div>
            <div style={POSTS_CARD_META_STYLE}>
              {[post.companyName, post.department, post.location].filter(Boolean).join(" - ")}
            </div>
          </div>
          <CareerPostStatusBadge status={post.status} />
        </div>

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span className="wm-career-pill wm-career-pill--pay">
            {post.totalApplications} Applicants
          </span>
        </div>

        <EnterpriseResponsiveGrid
          minItemWidth={120}
          gap={8}
          testId={`career-post-stats-${post.id}`}
        >
          <PostStat label="Applications" value={post.totalApplications} />
          <PostStat label="Interviews" value={post.inInterview} />
          <PostStat label="Offers" value={post.offered} />
          <PostStat label="Hired" value={post.hired} />
        </EnterpriseResponsiveGrid>

        <div style={POSTS_FOOTER_STYLE}>
          <span>Updated: {formatPostDate(post.updatedAt || post.createdAt)}</span>
        </div>
      </button>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="button" className="wm-career-cta" style={{ flex: 1 }} onClick={onOpen}>
          View
        </button>
        <button
          type="button"
          className="wm-career-cta"
          style={{ flex: 1, opacity: 0.85 }}
          onClick={onOpen}
        >
          Manage
        </button>
      </div>
    </div>
  );
}

function PostStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={POSTS_STAT_STYLE}>
      <div style={POSTS_STAT_LABEL_STYLE}>{label}</div>
      <div style={POSTS_STAT_VALUE_STYLE}>{value}</div>
    </div>
  );
}
