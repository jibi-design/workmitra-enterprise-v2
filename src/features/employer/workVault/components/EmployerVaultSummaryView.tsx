// src/features/employer/workVault/components/EmployerVaultSummaryView.tsx

import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";

/* ------------------------------------------------------------------ */
/* Shared: Info Row                                                   */
/* ------------------------------------------------------------------ */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--wm-er-muted)", flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Labels                                                             */
/* ------------------------------------------------------------------ */
const STATUS_LABELS: Record<string, string> = {
  employed: "Employed",
  available: "Available",
  not_looking: "Not looking",
};

const ROLE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
};

const NOTICE_LABELS: Record<string, string> = {
  immediate: "Immediate",
  "2_weeks": "2 weeks",
  "1_month": "1 month",
  "2_months": "2 months",
  "3_months": "3 months",
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
type Props = {
  data: VaultSectionData["professionalSummary"];
};

export function EmployerVaultSummaryView({ data }: Props) {
  const statusColor =
    data.resolvedStatus === "employed"
      ? "#16a34a"
      : data.resolvedStatus === "available"
        ? "#2563eb"
        : "#6b7280";

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "var(--wm-er-bg, #fff)",
        border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
      }}
    >
      {data.headline && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10, lineHeight: 1.5 }}>
          {data.headline}
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        <InfoRow label="Status">
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "2px 10px",
              borderRadius: 999,
              background: `${statusColor}10`,
              border: `1px solid ${statusColor}22`,
              color: statusColor,
            }}
          >
            {STATUS_LABELS[data.resolvedStatus] ?? data.resolvedStatus}
          </span>
        </InfoRow>

        {data.resolvedStatus === "employed" && data.resolvedCompany && (
          <InfoRow label="Current company">
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {data.resolvedCompany}
            </span>
          </InfoRow>
        )}

        <InfoRow label="Expected role">
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {ROLE_LABELS[data.expectedRoleType] ?? data.expectedRoleType}
          </span>
        </InfoRow>

        <InfoRow label="Notice period">
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {NOTICE_LABELS[data.noticePeriod] ?? data.noticePeriod}
          </span>
        </InfoRow>
      </div>
    </div>
  );
}