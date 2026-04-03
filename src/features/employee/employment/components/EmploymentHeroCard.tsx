// src/features/employee/employment/components/EmploymentHeroCard.tsx
//
// Company hero card with status badge, verified badge, hire method.

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { statusMeta } from "../helpers/employmentDetailHelpers";

function IconBriefcase({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z"
      />
    </svg>
  );
}

type Props = {
  record: EmploymentRecord;
};

export function EmploymentHeroCard({ record }: Props) {
  const sm = statusMeta(record.status);

  return (
    <div
      className="wm-ee-card"
      style={{ borderLeft: `4px solid ${sm.color}`, display: "flex", alignItems: "center", gap: 14 }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: sm.color + "12", flexShrink: 0 }}>
        <IconBriefcase color={sm.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-emp-text, var(--wm-er-text))", lineHeight: 1.3 }}>{record.jobTitle}</div>
        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>{record.companyName}</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: sm.color + "14", color: sm.color, border: `1px solid ${sm.color}33` }}>{sm.label}</span>
          {record.verified && (
            <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)" }}>Verified</span>
          )}
          {record.hireMethod === "via_app" && (
            <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}>Via App</span>
          )}
        </div>
      </div>
    </div>
  );
}