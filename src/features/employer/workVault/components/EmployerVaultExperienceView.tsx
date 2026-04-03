// src/features/employer/workVault/components/EmployerVaultExperienceView.tsx

import type { VaultWorkExperienceEntry } from "../../../employee/workVault/types/vaultProfileTypes";

const STATUS_COLORS: Record<string, string> = {
  hired: "#16a34a",
  completed: "#3730a3",
  left: "#6b7280",
  terminated: "#dc2626",
};

type Props = {
  entries: VaultWorkExperienceEntry[];
};

export function EmployerVaultExperienceView({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
        No work experience recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {entries.map((entry) => {
        const start = new Date(entry.hiredAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
        });
        const end = entry.endedAt
          ? new Date(entry.endedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })
          : "Present";

        return (
          <div
            key={entry.jobId}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
              background: "var(--wm-er-bg, #fff)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
              {entry.jobTitle || "Untitled Role"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {entry.companyName}
              {entry.department ? ` · ${entry.department}` : ""}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--wm-er-muted)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>
                {start} — {end}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  padding: "1px 8px",
                  borderRadius: 999,
                  background: `${STATUS_COLORS[entry.status] ?? "#6b7280"}10`,
                  color: STATUS_COLORS[entry.status] ?? "#6b7280",
                  textTransform: "capitalize",
                }}
              >
                {entry.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}