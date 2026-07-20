// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeActivitySection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeActivitySection.tsx

import type { WorkforceActivityEntry } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconActivity } from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  sectionIconWrapStyle,
  sectionTitleStyle,
  timeAgo,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  recentActivity: WorkforceActivityEntry[];
};

export function EmployerWorkforceHomeActivitySection({ recentActivity }: Props) {
  if (recentActivity.length === 0) {
    return <div style={{ height: 24 }} />;
  }

  return (
    <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
      <div style={sectionTitleStyle}>
        <div style={sectionIconWrapStyle}>
          <IconActivity />
        </div>
        Recent Activity
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {recentActivity.map((entry) => (
          <div
            key={entry.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              padding: "6px 0",
              borderBottom: "1px solid var(--wm-er-border)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--wm-er-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.title}
              </div>

              {entry.body && (
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {entry.body}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "var(--wm-er-muted)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {timeAgo(entry.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
