// App name: Job Mitra
// File name: ShiftApplyJobCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftApplyJobCard.tsx

import type { CSSProperties } from "react";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import type { ShiftPostDemo, ShiftPayBasis } from "../helpers/shiftApplyHelpers";
import { cap, expLabel, fmtDateRange } from "../helpers/shiftApplyHelpers";

const SHIFT_GREEN = "var(--wm-er-accent-shift, #16a34a)";

export type ShiftApplyCardStatus =
  "applied" | "shortlisted" | "waiting" | "selected" | "workspace_ready" | "withdrawn" | "none";

type Props = {
  post: ShiftPostDemo;
  status: ShiftApplyCardStatus;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderLeft: "4px solid var(--wm-er-accent-shift, #16a34a)",
  borderRadius: 22,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 14px 30px rgba(15,23,42,0.055)",
};

const PAY_BADGE_STYLE: CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-end",
  padding: "8px 11px",
  borderRadius: 16,
  background: "rgba(22,163,74,0.08)",
  color: SHIFT_GREEN,
  fontSize: 15,
  fontWeight: 950,
  border: "1px solid rgba(22,163,74,0.2)",
  flexShrink: 0,
};

const META_GRID_STYLE: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

function getStatusUi(status: ShiftApplyCardStatus): {
  label: string;
  background: string;
  color: string;
  border: string;
} | null {
  if (status === "applied") {
    return {
      label: "Applied",
      background: "rgba(22,163,74,0.1)",
      color: "var(--wm-er-accent-shift, #16a34a)",
      border: "1px solid rgba(22,163,74,0.18)",
    };
  }

  if (status === "shortlisted") {
    return {
      label: "Shortlisted",
      background: "rgba(161,98,7,0.12)",
      color: "#a16207",
      border: "1px solid rgba(161,98,7,0.18)",
    };
  }

  if (status === "waiting") {
    return {
      label: "Waiting List",
      background: "rgba(180,83,9,0.12)",
      color: "#b45309",
      border: "1px solid rgba(180,83,9,0.18)",
    };
  }

  if (status === "selected") {
    return {
      label: "Selected",
      background: "rgba(29,78,216,0.1)",
      color: "#1d4ed8",
      border: "1px solid rgba(29,78,216,0.18)",
    };
  }

  if (status === "workspace_ready") {
    return {
      label: "Shift Active",
      background: "rgba(22,163,74,0.12)",
      color: "#15803d",
      border: "1px solid rgba(22,163,74,0.18)",
    };
  }

  if (status === "withdrawn") {
    return {
      label: "Withdrawn",
      background: "rgba(217,119,6,0.1)",
      color: "#d97706",
      border: "1px solid rgba(217,119,6,0.18)",
    };
  }

  return null;
}

export function ShiftApplyJobCard({ post, status }: Props) {
  const dateRange = fmtDateRange(post.startAt, post.endAt);
  const statusUi = getStatusUi(status);
  const jobTitle = getSafeText(post.jobName, "Shift work");
  const employerName = getSafeEntityText(post.companyName, "Employer not specified");
  const locationName = getSafeEntityText(post.locationName, "Location not specified");
  const payDisplay = formatShiftPayDisplay(post.payPerDay, post.payBasis);

  return (
    <section className="wm-ee-card" style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 18, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.25 }}
          >
            {jobTitle}
          </div>

          <div
            style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.45 }}
          >
            {employerName} · {locationName} · {dateRange}
          </div>

          <div style={{ marginTop: 8 }}>
            <EmployerTrustBadge variant="compact" />
          </div>
        </div>

        <div style={PAY_BADGE_STYLE}>
          <span>{payDisplay}</span>
          <span
            style={{ marginTop: 2, fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)" }}
          >
            shift pay
          </span>
        </div>
      </div>

      {statusUi && (
        <div style={{ marginTop: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "5px 10px",
              borderRadius: 999,
              background: statusUi.background,
              color: statusUi.color,
              border: statusUi.border,
            }}
          >
            {statusUi.label}
          </span>
        </div>
      )}

      <div style={META_GRID_STYLE}>
        <DetailBox label="Company" value={employerName} />
        <DetailBox
          label="Location"
          value={`${locationName}${post.distanceKm > 0 && locationName !== "Location not specified" ? ` · ${post.distanceKm} km` : ""}`}
        />
        <DetailBox label="Date" value={dateRange} />
        <DetailBox label="Experience" value={expLabel(post.experience)} />
      </div>
    </section>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 10px",
        borderRadius: 14,
        background: "rgba(248,250,252,0.96)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 850,
          color: "var(--wm-er-text)",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatShiftPayDisplay(amount: number, payBasis: ShiftPayBasis | undefined): string {
  if (payBasis === "not_listed") return "Pay not listed";
  if (payBasis === "per_hour") return amount > 0 ? `${amount} / hour` : "Pay not listed";
  if (payBasis === "fixed_total") return amount > 0 ? `${amount} total` : "Pay not listed";

  return amount > 0 ? `${amount} / day` : "Pay not listed";
}

function getSafeText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cap(cleaned) : fallback;
}

function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cap(cleaned) : fallback;
}
