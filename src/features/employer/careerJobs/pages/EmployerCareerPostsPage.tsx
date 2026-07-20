// App name: Job Mitra
// File name: EmployerCareerPostsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerPostsPage.tsx

import type { CSSProperties } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  filterCareerPosts,
  formatPostDate,
  getCareerPostStatusLabel,
  getCareerPostStatusStyle,
  type CareerPostStatusFilter,
} from "../helpers/employerCareerPostList.helpers";
import {
  getCareerHomePostsSnapshot,
  subscribeCareerHomePosts,
} from "../helpers/employerCareerHome.helpers";
import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import type { CareerJobPost } from "../types/careerTypes";

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

// Premium CSS Injection for Hover effects and responsive states
const PREMIUM_STYLE_SHEET = `
  .wm-hover-card {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  /* Desktop Hover Animation */
  .wm-hover-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 32px -8px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  /* Mobile Touch/Tap Animation */
  .wm-hover-card:active {
    transform: scale(0.98) !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
    transition: transform var(--wm-motion-fast) var(--wm-motion-spring), box-shadow var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-responsive-stat-grid {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 8px !important;
  }
  @media (max-width: 580px) {
    .wm-responsive-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
`;

export function EmployerCareerPostsPage() {
  const nav = useNavigate();
  const posts = useSyncExternalStore(
    subscribeCareerHomePosts,
    getCareerHomePostsSnapshot,
    getCareerHomePostsSnapshot,
  );

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CareerPostStatusFilter>("all");

  const filtered = useMemo(
    () => filterCareerPosts({ posts, query, status }),
    [posts, query, status],
  );

  return (
    <div className="wm-er-vCareer" style={PAGE_STYLE}>
      {/* Injecting CSS block for hover animations and query break points safely */}
      <style>{PREMIUM_STYLE_SHEET}</style>

      <section style={HERO_STYLE}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(29,78,216,0.05))",
              color: "#2563eb",
              border: "1px solid rgba(37,99,235,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <div style={EYEBROW_STYLE}>Career posts</div>
            <div style={{ ...TITLE_STYLE, marginTop: 4 }}>Career Post List</div>
            <div style={SUBTITLE_STYLE}>
              Active posts appear first. Filled, paused, draft, and closed posts stay available for
              review and future reuse.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => nav(ROUTE_PATHS.employerCareerCreate)}
          style={CREATE_BUTTON_STYLE}
        >
          Create Career Job
        </button>
      </section>

      <section style={FILTER_CARD_STYLE}>
        {/* Search Input Box Wrapper with magnifying glass icon */}
        <div style={{ position: "relative", width: "100%" }}>
          <span style={SEARCH_ICON_STYLE}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by job, company, department, or location"
            style={{ ...INPUT_STYLE, paddingLeft: 40 }}
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as CareerPostStatusFilter)}
          style={INPUT_STYLE}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="filled">Filled</option>
          <option value="closed">Closed</option>
        </select>
      </section>

      {filtered.length === 0 ? (
        <CareerPostsEmptyState
          hasAnyPosts={posts.length > 0}
          onCreate={() => nav(ROUTE_PATHS.employerCareerCreate)}
        />
      ) : (
        <section style={{ display: "grid", gap: 16 }}>
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={() =>
                nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", post.id))
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}

function CareerPostsEmptyState({
  hasAnyPosts,
  onCreate,
}: {
  hasAnyPosts: boolean;
  onCreate: () => void;
}) {
  return (
    <section style={EMPTY_STATE_STYLE}>
      <div style={EMPTY_ICON_STYLE} aria-hidden="true">
        +
      </div>
      <div style={EMPTY_TITLE_STYLE}>
        {hasAnyPosts ? "No posts match this filter" : "No Career posts yet"}
      </div>
      <div style={EMPTY_TEXT_STYLE}>
        {hasAnyPosts
          ? "Try a different search term or status filter to find the post you need."
          : "Create your first Career Job to start long-term hiring. Active posts will appear first, and filled or closed posts will stay here for future review."}
      </div>
      {!hasAnyPosts && (
        <button type="button" onClick={onCreate} style={EMPTY_BUTTON_STYLE}>
          Create Career Job
        </button>
      )}
      <div style={EMPTY_GUIDE_STYLE}>
        <div style={EMPTY_GUIDE_TITLE_STYLE}>How this page works</div>
        <div style={EMPTY_GUIDE_TEXT_STYLE}>
          Use this page as the employer’s full post list. Keep the Career Home clean, and open posts
          here when you need details, applicants, or future reuse.
        </div>
      </div>
    </section>
  );
}

function PostCard({ post, onOpen }: { post: CareerJobPost; onOpen: () => void }) {
  const statusStyle = getCareerPostStatusStyle(post.status);

  return (
    <button type="button" onClick={onOpen} className="wm-hover-card" style={POST_CARD_STYLE}>
      <PulseTargetIndicator notificationId="APPLICATION_RECEIVED" postId={post.id} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={POST_TITLE_STYLE}>{post.jobTitle}</div>
          <div style={POST_META_STYLE}>
            {[post.companyName, post.department, post.location].filter(Boolean).join(" - ")}
          </div>
        </div>
        <span style={{ ...STATUS_BADGE_STYLE, ...statusStyle }}>
          {getCareerPostStatusLabel(post.status)}
        </span>
      </div>

      <div className="wm-responsive-stat-grid">
        <Stat label="Applications" value={post.totalApplications} />
        <Stat label="Interviews" value={post.inInterview} />
        <Stat label="Offers" value={post.offered} />
        <Stat label="Hired" value={post.hired} />
      </div>

      <div style={FOOTER_STYLE}>
        <span>Updated: {formatPostDate(post.updatedAt || post.createdAt)}</span>
        <span style={OPEN_TEXT_STYLE}>Open post</span>
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={STAT_STYLE}>
      <div style={STAT_LABEL_STYLE}>{label}</div>
      <div style={STAT_VALUE_STYLE}>{value}</div>
    </div>
  );
}

// ULTRA-PREMIUM STYLES
const PAGE_STYLE: CSSProperties = { display: "grid", gap: 16, paddingBottom: 40 };

const HERO_STYLE: CSSProperties = {
  padding: 24,
  borderRadius: 28,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(239,246,255,0.8), rgba(255,255,255,0.95))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

const EYEBROW_STYLE: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  color: CAREER_BLUE_DEEP,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};
const TITLE_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};
const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  color: CAREER_MUTED,
  lineHeight: 1.5,
  fontWeight: 600,
};

const CREATE_BUTTON_STYLE: CSSProperties = {
  marginTop: 16,
  width: "100%",
  minHeight: 48,
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
};

const FILTER_CARD_STYLE: CSSProperties = { display: "grid", gap: 10 };
const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "#fff",
  padding: "0 16px",
  color: CAREER_TEXT,
  fontSize: 13,
  fontWeight: 600,
  outline: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};

const SEARCH_ICON_STYLE: CSSProperties = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
  zIndex: 10,
};

const POST_CARD_STYLE: CSSProperties = {
  width: "100%",
  padding: 20,
  borderRadius: 24,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  textAlign: "left",
  cursor: "pointer",
  outline: "none",
  position: "relative",
};

const POST_TITLE_STYLE: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};
const POST_META_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: CAREER_MUTED,
  fontWeight: 600,
};

const STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 10,
  fontWeight: 900,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
};

const STAT_STYLE: CSSProperties = {
  padding: "10px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(0,0,0,0.04)",
  minWidth: 0,
};
const STAT_LABEL_STYLE: CSSProperties = {
  fontSize: 10,
  color: CAREER_MUTED,
  fontWeight: 800,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const STAT_VALUE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 16,
  color: CAREER_BLUE_DEEP,
  fontWeight: 900,
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: 16,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  color: CAREER_MUTED,
  fontSize: 11,
  fontWeight: 700,
};
const OPEN_TEXT_STYLE: CSSProperties = { color: CAREER_BLUE_DEEP, fontWeight: 900 };

const EMPTY_STATE_STYLE: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  border: "1px dashed rgba(29,78,216,0.3)",
  background: "rgba(255,255,255,0.6)",
  textAlign: "center",
};
const EMPTY_ICON_STYLE: CSSProperties = {
  width: 48,
  height: 48,
  margin: "0 auto",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,0.1)",
  color: "#2563eb",
  fontSize: 24,
  fontWeight: 900,
};
const EMPTY_TITLE_STYLE: CSSProperties = {
  marginTop: 16,
  fontSize: 16,
  fontWeight: 900,
  color: CAREER_TEXT,
};
const EMPTY_TEXT_STYLE: CSSProperties = {
  margin: "8px auto 0",
  maxWidth: 400,
  fontSize: 13,
  fontWeight: 600,
  color: CAREER_MUTED,
  lineHeight: 1.5,
};
const EMPTY_BUTTON_STYLE: CSSProperties = {
  marginTop: 16,
  padding: "12px 24px",
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};
const EMPTY_GUIDE_STYLE: CSSProperties = {
  marginTop: 24,
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.8)",
  textAlign: "left",
};
const EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: CAREER_BLUE_DEEP,
};
const EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 600,
  color: CAREER_MUTED,
  lineHeight: 1.5,
};
