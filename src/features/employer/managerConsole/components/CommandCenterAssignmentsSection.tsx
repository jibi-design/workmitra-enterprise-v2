// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CommandCenterAssignmentsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\managerConsole\components\CommandCenterAssignmentsSection.tsx

import type { CSSProperties } from "react";

export type CommandCenterSiteGroup = {
  site: string;
  staff: { name: string; shift: string }[];
};

const SECTION_CARD: CSSProperties = {
  padding: 16,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
};

const SECTION_TITLE: CSSProperties = {
  fontWeight: 900,
  fontSize: 14,
  color: "var(--wm-er-text)",
  marginBottom: 12,
};

type Props = {
  groups: CommandCenterSiteGroup[];
};

export function CommandCenterAssignmentsSection({ groups }: Props) {
  return (
    <div style={SECTION_CARD}>
      <div style={SECTION_TITLE}>Today's Site Assignments</div>

      {groups.length === 0 ? (
        <div
          style={{
            padding: "14px 0",
            textAlign: "center",
            fontSize: 13,
            color: "var(--wm-er-muted)",
          }}
        >
          No site assignments for today
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groups.map((group) => (
            <div
              key={group.site}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--wm-er-accent-console-border)",
                background: "var(--wm-er-accent-console-light)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{ fontWeight: 800, fontSize: 13, color: "var(--wm-er-accent-console)" }}
                >
                  {group.site}
                </div>

                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "var(--wm-er-accent-console)",
                    color: "#fff",
                  }}
                >
                  {group.staff.length} staff
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.staff.map((staffMember, index) => (
                  <div
                    key={`${staffMember.name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderTop: index > 0 ? "1px solid rgba(3,105,161,0.1)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>
                      {staffMember.name}
                    </span>

                    <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                      {staffMember.shift}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
