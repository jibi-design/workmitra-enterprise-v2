// App name: Job Mitra
// File name: EmployerCareerRecentPosts.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\EmployerCareerRecentPosts.tsx

import { getCareerHomeStatusDisplay } from "../helpers/employerCareerHome.helpers";
import type { CareerJobPost } from "../types/careerTypes";
import { EmployerCareerIconArrowRight, EmployerCareerIconEmpty } from "./EmployerCareerHomeIcons";

type EmployerCareerRecentPostsProps = {
  posts: CareerJobPost[];
  onOpenPost: (postId: string) => void;
  onCreate: () => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatJobType(value: CareerJobPost["jobType"]): string {
  if (value === "full-time") return "Full-time";
  if (value === "part-time") return "Part-time";
  return "Contract";
}

function formatWorkMode(value: CareerJobPost["workMode"]): string {
  if (value === "on-site") return "On-site";
  if (value === "remote") return "Remote";
  return "Hybrid";
}

function formatSalary(post: CareerJobPost): string {
  const period = post.salaryPeriod === "yearly" ? "Annual" : "Monthly";

  if (post.salaryMin <= 0 && post.salaryMax <= 0) return `Not specified (${period})`;

  const max = post.salaryMax > 0 ? post.salaryMax : post.salaryMin;

  if (post.salaryMin === max) {
    return `${post.salaryMin.toLocaleString()} (${period})`;
  }

  return `${post.salaryMin.toLocaleString()} - ${max.toLocaleString()} (${period})`;
}

function formatExperience(post: CareerJobPost): string {
  if (post.experienceMin <= 0 && post.experienceMax <= 0) return "Fresher / Any";

  if (post.experienceMin === post.experienceMax) {
    return `${post.experienceMin} year${post.experienceMin === 1 ? "" : "s"}`;
  }

  return `${post.experienceMin} - ${post.experienceMax} years`;
}

function formatClosingDate(value: number): string {
  if (!value) return "No closing date";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "No closing date";
  }
}

export function EmployerCareerRecentPosts({ posts, onOpenPost }: EmployerCareerRecentPostsProps) {
  if (posts.length === 0) {
    return <EmployerCareerEmptyPosts />;
  }

  return (
    <section style={{ display: "grid", gap: 9 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 950, color: CAREER_TEXT }}>Hiring pipeline</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11.5,
            fontWeight: 750,
            color: CAREER_MUTED,
            lineHeight: 1.45,
          }}
        >
          Open a Career Job to review applicants, offers, and hired workspace status.
        </div>
      </div>

      <div style={{ display: "grid", gap: 9 }}>
        {posts.map((post) => (
          <EmployerCareerRecentPostButton key={post.id} post={post} onOpenPost={onOpenPost} />
        ))}
      </div>
    </section>
  );
}

function EmployerCareerRecentPostButton({
  post,
  onOpenPost,
}: {
  post: CareerJobPost;
  onOpenPost: (postId: string) => void;
}) {
  const status = getCareerHomeStatusDisplay(post);
  const hasActivity =
    post.totalApplications > 0 || post.shortlisted > 0 || post.inInterview > 0 || post.hired > 0;
  const summaryLine = [post.department, post.location].filter(Boolean).join(" · ");
  const workLine = `${formatJobType(post.jobType)} · ${formatWorkMode(post.workMode)}`;

  return (
    <button
      type="button"
      onClick={() => onOpenPost(post.id)}
      style={{
        width: "100%",
        padding: 13,
        borderRadius: 22,
        border: "1px solid rgba(29,78,216,0.14)",
        background:
          "radial-gradient(circle at 96% 8%, rgba(29,78,216,0.065), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.99))",
        boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 950,
              color: CAREER_TEXT,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.22,
            }}
          >
            {formatDisplayTitle(post.jobTitle)}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              fontWeight: 850,
              color: CAREER_MUTED,
              lineHeight: 1.45,
            }}
          >
            {post.companyName}
            {summaryLine ? ` · ${summaryLine}` : ""}
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "5px 9px",
            borderRadius: 999,
            background:
              post.status === "active"
                ? "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(239,246,255,0.96))"
                : hasActivity
                  ? "rgba(29,78,216,0.07)"
                  : "rgba(15,23,42,0.055)",
            color:
              post.status === "active"
                ? CAREER_BLUE_DEEP
                : hasActivity
                  ? CAREER_BLUE_DEEP
                  : "rgba(15,23,42,0.58)",
            fontSize: 10.5,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 7,
        }}
      >
        <SummaryBox label="Work" value={workLine} />
        <SummaryBox label="Salary" value={formatSalary(post)} />
        <SummaryBox label="Closing" value={formatClosingDate(post.closingDate)} />
        <SummaryBox label="Experience" value={formatExperience(post)} />
      </div>

      <div
        style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 7 }}
      >
        <MiniStat label="Applied" value={post.totalApplications} />
        <MiniStat label="Shortlist" value={post.shortlisted} />
        <MiniStat label="Review" value={post.inInterview} />
        <MiniStat label="Hired" value={post.hired} />
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 950, color: CAREER_BLUE_DEEP }}>
          Open hiring dashboard
        </span>
        <span
          style={{
            width: 25,
            height: 25,
            borderRadius: 999,
            border:
              post.status === "active"
                ? "1px solid rgba(29,78,216,0.28)"
                : "1px solid rgba(15,23,42,0.06)",
            background: "rgba(29,78,216,0.055)",
            color: CAREER_BLUE_DEEP,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmployerCareerIconArrowRight />
        </span>
      </div>
    </button>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "8px 9px",
        borderRadius: 13,
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 950,
          color: CAREER_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.35,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11.5,
          fontWeight: 900,
          color: CAREER_TEXT,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const isActive = value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "8px 7px",
        borderRadius: 13,
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(29,78,216,0.08)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, color: CAREER_MUTED }}>{label}</div>
      <div
        style={{
          marginTop: 3,
          fontSize: 13,
          fontWeight: 950,
          color: isActive ? CAREER_BLUE : "rgba(15,23,42,0.58)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmployerCareerEmptyPosts() {
  return (
    <section
      style={{
        width: "100%",
        padding: 16,
        borderRadius: 26,
        border: "1px solid rgba(29,78,216,0.16)",
        background:
          "radial-gradient(circle at 92% 4%, rgba(37,99,235,0.11), transparent 32%), linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.99), rgba(239,246,255,0.7))",
        boxShadow: "0 18px 38px rgba(15,23,42,0.075)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 19,
            background: "rgba(29,78,216,0.08)",
            color: CAREER_BLUE,
            border: "1px solid rgba(29,78,216,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <EmployerCareerIconEmpty />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.22 }}>
            Start your first long-term hiring pipeline
          </div>

          <div style={{ marginTop: 6, fontSize: 12.5, color: CAREER_MUTED, lineHeight: 1.5 }}>
            Use the main Create Career Job button above. After selection and hiring, employee
            workspaces will appear in the Hired employees section.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "10px 11px",
          borderRadius: 16,
          background: "rgba(29,78,216,0.055)",
          color: CAREER_BLUE_DEEP,
          fontSize: 11.5,
          fontWeight: 850,
          lineHeight: 1.45,
        }}
      >
        Flow: create post → receive applicants → shortlist or offer → hire → workspace appears.
      </div>
    </section>
  );
}
