// App name: Job Mitra
// File name: ShiftHomeRecentPosts.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeRecentPosts.tsx

import { PulseNode } from "../../../pulse/PulseNode";
import { countApplicationsForPost, getPostStatusDisplay } from "../helpers/shiftHomeHelpers";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { IconEmpty, IconPlus } from "./ShiftHomeIcons";
import { shiftHomeRecentPostButton, shiftHomeSectionTitle } from "./ShiftHomeSectionStyles";

type ShiftHomeRecentPostsProps = {
  posts: ShiftPost[];
  onOpen: (id: string) => void;
  onCreate: () => void;
};

export function ShiftHomeRecentPosts({ posts, onOpen, onCreate }: ShiftHomeRecentPostsProps) {
  if (posts.length === 0) {
    return <ShiftHomeNoPostsState onCreate={onCreate} />;
  }

  const pulseTargetPostId = findPulseTargetPostId(posts);

  return (
    <div style={{ marginTop: 16, marginBottom: 24 }}>
      <div style={shiftHomeSectionTitle}>Recent Posts</div>

      <div style={{ display: "grid", gap: 10 }}>
        {posts.map((post) => {
          const postButton = (
            <button
              type="button"
              className="wm-press-card"
              style={shiftHomeRecentPostButton}
              onClick={() => onOpen(post.id)}
            >
              <RecentPostButtonContent post={post} />
            </button>
          );

          if (post.id !== pulseTargetPostId) {
            return <div key={post.id}>{postButton}</div>;
          }

          return (
            <PulseNode
              key={post.id}
              id="shift-dashboard-applications"
              style={{ "--wm-pulse-node-radius": "20px" }}
            >
              {postButton}
            </PulseNode>
          );
        })}
      </div>
    </div>
  );
}

function findPulseTargetPostId(posts: readonly ShiftPost[]): string | undefined {
  const postWithPendingApplications = posts.find((post) => {
    return countApplicationsForPost(post.id, "applied") > 0;
  });

  return postWithPendingApplications?.id ?? posts[0]?.id;
}

function ShiftHomeNoPostsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "34px 16px",
          textAlign: "center",
        }}
      >
        <IconEmpty />

        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
          No shift posts yet
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--wm-er-muted)",
            maxWidth: 290,
            lineHeight: 1.55,
          }}
        >
          Create your first shift post to start receiving applications from workers.
        </div>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onCreate}
          style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <IconPlus /> Create First Shift
        </button>
      </div>
    </div>
  );
}

function RecentPostButtonContent({ post }: { post: ShiftPost }) {
  const applied = countApplicationsForPost(post.id, "applied");
  const statusDisplay = getPostStatusDisplay(post);
  const dateText = formatDateRange(post.startAt, post.endAt);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.jobName}
          </div>

          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
            {post.companyName} - {post.locationName}
          </div>

          {applied > 0 ? <ReviewPendingBadge count={applied} /> : null}
        </div>

        <span
          style={{
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.14)",
            fontSize: 11,
            fontWeight: 800,
            color: statusDisplay.color,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {statusDisplay.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
        <MiniMetric label="Applied" value={applied} tone={applied > 0 ? "shift" : "neutral"} />
        <MiniMetric
          label="Shortlist"
          value={post.shortlistIds.length}
          tone={post.shortlistIds.length > 0 ? "warning" : "neutral"}
        />
        <MiniMetric
          label="Confirmed"
          value={post.confirmedIds.length}
          tone={post.confirmedIds.length > 0 ? "success" : "neutral"}
        />
        <MiniMetric
          label="Vacancy"
          value={post.vacancies}
          tone={post.vacancies > 0 ? "shift" : "neutral"}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          fontSize: 11,
          color: "var(--wm-er-muted)",
        }}
      >
        <span>{dateText}</span>
        <span style={{ fontWeight: 800, color: "var(--wm-er-accent-shift, #16a34a)" }}>
          {post.payPerDay > 0 ? `${post.payPerDay} / day` : "Pay not set"}
        </span>
      </div>
    </div>
  );
}

function ReviewPendingBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        marginTop: 7,
        width: "fit-content",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 8px",
        borderRadius: 999,
        background: "rgba(254,243,199,0.95)",
        border: "1px solid rgba(245,158,11,0.18)",
        color: "#b45309",
        fontSize: 10,
        lineHeight: 1,
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "#f59e0b",
          boxShadow: "0 0 0 3px rgba(245,158,11,0.12)",
        }}
      />
      {count} Review{count !== 1 ? "s" : ""} Pending
    </span>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "shift" | "warning" | "success";
}) {
  return (
    <div
      style={{
        padding: "7px 6px",
        borderRadius: 10,
        background: "rgba(248,250,252,0.95)",
        border: "1px solid rgba(226,232,240,0.9)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)" }}>{label}</div>
      <div
        style={{ marginTop: 2, fontSize: 13, fontWeight: 950, color: getMetricColor(value, tone) }}
      >
        {value}
      </div>
    </div>
  );
}

function getMetricColor(value: number, tone: "neutral" | "shift" | "warning" | "success"): string {
  if (value === 0) return "var(--wm-er-muted)";

  if (tone === "warning") return "#b45309";
  if (tone === "success") return "var(--wm-success, #16a34a)";
  if (tone === "shift") return "var(--wm-er-accent-shift, #16a34a)";

  return "var(--wm-er-text)";
}

function formatDateRange(startAt: number, endAt: number): string {
  const start = new Date(startAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  const end = new Date(endAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" });

  return start === end ? start : `${start} to ${end}`;
}
