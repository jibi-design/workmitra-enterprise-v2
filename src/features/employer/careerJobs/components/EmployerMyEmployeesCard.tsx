// App name: Job Mitra
// File name: EmployerMyEmployeesCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\EmployerMyEmployeesCard.tsx

import { useState, useSyncExternalStore } from "react";
import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import {
  CARD_STYLE,
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  getSnapshot,
  INACTIVE_BADGE_BG,
  INACTIVE_BADGE_TEXT,
  isActiveStaff,
  needsAction,
} from "./EmployerMyEmployeesCard.helpers";
import {
  EmployeeWorkspaceRow,
  EmptyWorkspaceState,
  SummaryChip,
  WorkspaceIcon,
} from "./EmployerMyEmployeesCard.parts";

type Props = {
  onOpenPost: (careerPostId: string) => void;
};

export function EmployerMyEmployeesCard({ onOpenPost }: Props) {
  const records = useSyncExternalStore(myStaffStorage.subscribe, getSnapshot, getSnapshot);
  const [thirtyDaysAgo] = useState(() => Date.now() - 30 * 86_400_000);

  const relevant = records.filter(
    (record) => record.status !== "exited" || (record.exitedAt && record.exitedAt > thirtyDaysAgo),
  );

  const activeCount = records.filter(isActiveStaff).length;
  const needsActionCount = relevant.filter(needsAction).length;
  const hasActiveEmployees = activeCount > 0;
  const hasActionNeeded = needsActionCount > 0;

  return (
    <section className="wm-er-card wm-career-card wm-career-card--employer" style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 46,
              height: 46,
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
            <WorkspaceIcon />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.22 }}>
              Hired Employee Workspaces
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11.5,
                fontWeight: 750,
                color: CAREER_MUTED,
                lineHeight: 1.42,
              }}
            >
              Manage joined workers, notices, completions, and rating follow-up.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "5px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: hasActiveEmployees ? "rgba(29,78,216,0.09)" : INACTIVE_BADGE_BG,
            color: hasActiveEmployees ? CAREER_BLUE_DEEP : INACTIVE_BADGE_TEXT,
            fontSize: 10.5,
            fontWeight: 950,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {activeCount} active
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <SummaryChip label="Workspace records" value={relevant.length} />
        <SummaryChip label="Needs action" value={needsActionCount} active={hasActionNeeded} />
      </div>

      {relevant.length === 0 ? (
        <EmptyWorkspaceState />
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {relevant.map((record) => (
            <EmployeeWorkspaceRow key={record.id} record={record} onOpenPost={onOpenPost} />
          ))}
        </div>
      )}
    </section>
  );
}
