// src/features/employee/careerJobs/components/CareerWorkspaceComponents.tsx
//
// Sub-components for EmployeeCareerWorkspacePage.
// InfoRow (job details) + UpdateCard (updates feed).

import type { CareerWorkspaceUpdate } from "../../../career/types/careerDomainTypes";
import {
  fmtDateTime,
  updateKindLabel,
  updateKindTone,
  updateRowBorder,
  updateRowBg,
  toneBadgeStyle,
} from "../helpers/careerWorkspaceDisplayHelpers";

/* ── InfoRow ───────────────────────────────────── */

export function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-career-muted, #6b7280)" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--wm-career-text, #111827)",
          textAlign: "right",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ── UpdateCard ────────────────────────────────── */

export function UpdateCard({ update }: { update: CareerWorkspaceUpdate }) {
  const kindTone = updateKindTone(update.kind);

  return (
    <div
      style={{
        border: updateRowBorder(update.kind),
        background: updateRowBg(update.kind),
        borderRadius: "var(--wm-radius-chip)",
        padding: "16px 20px",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-career-text, #111827)" }}>
            {update.title}
          </div>
          <span
            style={{
              height: 20,
              padding: "0 8px",
              borderRadius: "var(--wm-radius-pill)",
              display: "inline-flex",
              alignItems: "center",
              fontSize: 10,
              fontWeight: 700,
              ...toneBadgeStyle(kindTone),
            }}
          >
            {updateKindLabel(update.kind)}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--wm-career-muted, #6b7280)",
            whiteSpace: "nowrap",
          }}
        >
          {fmtDateTime(update.createdAt)}
        </div>
      </div>
      {update.body && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "var(--wm-career-muted, #6b7280)",
            lineHeight: 1.6,
          }}
        >
          {update.body}
        </div>
      )}
    </div>
  );
}
