// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerShiftPostCardBody.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\shiftPostCard\EmployerShiftPostCardBody.tsx

import {
  formatShiftPostDateRange,
  getShiftPostStatusLabel,
} from "../../helpers/employerShiftPosts.helpers";
import type { ShiftPost } from "../../storage/employerShift.storage";
import { EmployerShiftPostNextStepText } from "./EmployerShiftPostNextStepText";

type Props = {
  post: ShiftPost;
  appliedCount: number;
  needsAnalysis: boolean;
  statusColor: string;
  onOpen: (postId: string) => void;
};

function formatShiftPayDisplay(amount: number, payBasis: ShiftPost["payBasis"]): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "Pay not listed";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "Pay not listed";

  return amount > 0 ? `${amount} / day` : "Pay not listed";
}

export function EmployerShiftPostCardBody({
  post,
  appliedCount,
  needsAnalysis,
  statusColor,
  onOpen,
}: Props) {
  const payDisplay = formatShiftPayDisplay(post.payPerDay, post.payBasis);

  return (
    <button
      type="button"
      onClick={() => onOpen(post.id)}
      style={{
        width: "100%",
        padding: "12px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
      aria-label={`Open ${post.jobName} at ${post.companyName}`}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.jobName} - {post.companyName}
          </div>

          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
            {post.locationName} · {formatShiftPostDateRange(post.startAt, post.endAt)} ·{" "}
            {post.vacancies} {post.vacancies === 1 ? "vacancy" : "vacancies"}
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: statusColor,
            padding: "2px 8px",
            borderRadius: "var(--wm-radius-pill)",
            border: `1px solid ${statusColor}`,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {getShiftPostStatusLabel(post)}
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span className="wm-shift-pill wm-shift-pill--pay">{appliedCount} Applicants</span>
        <span style={{ fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 600 }}>
          {post.confirmedIds.length} confirmed ·{" "}
          {Math.max(0, post.vacancies - post.confirmedIds.length)} remaining
        </span>
      </div>

      <EmployerShiftPostNextStepText
        post={post}
        appliedCount={appliedCount}
        needsAnalysis={needsAnalysis}
      />

      <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 600 }}>
        Pay: {payDisplay}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <span
          className="wm-shift-cta wm-shift-cta--ghost"
          style={{ flex: 1, pointerEvents: "none" }}
        >
          View
        </span>
        <span className="wm-shift-cta" style={{ flex: 1, pointerEvents: "none" }}>
          Manage
        </span>
      </div>
    </button>
  );
}
