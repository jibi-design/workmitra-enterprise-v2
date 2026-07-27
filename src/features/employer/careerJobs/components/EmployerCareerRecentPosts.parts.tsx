import { getCareerHomeStatusDisplay } from "../helpers/employerCareerHome.helpers";
import type { CareerJobPost } from "../types/careerTypes";
import { EmployerCareerIconArrowRight, EmployerCareerIconEmpty } from "./EmployerCareerHomeIcons";
import {
  formatClosingDate,
  formatDisplayTitle,
  formatExperience,
  formatJobType,
  formatSalary,
  formatWorkMode,
} from "./EmployerCareerRecentPosts.helpers";
import {
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  EMPTY_SECTION_STYLE,
  MINI_STAT_STYLE,
  POST_BUTTON_STYLE,
  SUMMARY_BOX_STYLE,
} from "./EmployerCareerRecentPosts.styles";
import { StatusBadge, careerPostStatusToBadge } from "../../../../shared/components/enterprise";

export function EmployerCareerRecentPostButton({
  post,
  onOpenPost,
}: {
  post: CareerJobPost;
  onOpenPost: (postId: string) => void;
}) {
  const status = getCareerHomeStatusDisplay(post);
  const mapped = careerPostStatusToBadge(post.status);
  const hasActivity =
    post.totalApplications > 0 || post.shortlisted > 0 || post.inInterview > 0 || post.hired > 0;
  const summaryLine = [post.department, post.location].filter(Boolean).join(" · ");
  const workLine = `${formatJobType(post.jobType)} · ${formatWorkMode(post.workMode)}`;

  return (
    <button type="button" onClick={() => onOpenPost(post.id)} style={POST_BUTTON_STYLE}>
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

        <StatusBadge
          label={hasActivity ? status.label : mapped.label}
          tone={mapped.tone}
          accent="career"
        />
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
            borderRadius: "var(--wm-radius-pill)",
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
    <div style={SUMMARY_BOX_STYLE}>
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
    <div style={MINI_STAT_STYLE}>
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

export function EmployerCareerEmptyPosts() {
  return (
    <section style={EMPTY_SECTION_STYLE}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--wm-space-12)" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--wm-radius-chip)",
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
          borderRadius: "var(--wm-radius-chip)",
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
