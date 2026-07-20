// App name: Job Mitra
// File name: EmployerMyEmployeesCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\EmployerMyEmployeesCard.tsx

import { useState, useSyncExternalStore } from "react";
import { myStaffStorage, type StaffRecord } from "../../myStaff/storage/myStaff.storage";

type Props = {
  onOpenPost: (careerPostId: string) => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const INACTIVE_BADGE_BG = "rgba(15,23,42,0.055)";
const INACTIVE_BADGE_TEXT = "rgba(15,23,42,0.58)";

let cached: StaffRecord[] = [];

function getSnapshot(): StaffRecord[] {
  const fresh = myStaffStorage.getAll();

  if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
    cached = fresh;
  }

  return cached;
}

function WorkspaceIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
      />
    </svg>
  );
}

function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function isActiveStaff(record: StaffRecord): boolean {
  return (
    record.status === "joining_pending" ||
    record.status === "active" ||
    record.status === "probation" ||
    record.status === "resignation_pending" ||
    record.status === "notice_period"
  );
}

function getStatusLabel(status: StaffRecord["status"]): string {
  if (status === "joining_pending") return "Joining Pending";
  if (status === "probation") return "Probation";
  if (status === "resignation_pending") return "Resignation Pending";
  if (status === "notice_period") return "Notice Period";
  if (status === "exited") return "Exited";
  return "Currently Working";
}

function getStatusStyle(status: StaffRecord["status"]): React.CSSProperties {
  if (status === "resignation_pending" || status === "notice_period") {
    return {
      color: "#b45309",
      background: "rgba(217,119,6,0.08)",
    };
  }

  if (status === "exited") {
    return {
      color: CAREER_MUTED,
      background: "rgba(15,23,42,0.055)",
    };
  }

  return {
    color: CAREER_BLUE_DEEP,
    background: "rgba(29,78,216,0.08)",
  };
}

function needsAction(record: StaffRecord): boolean {
  return record.status === "joining_pending" || record.status === "resignation_pending";
}

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
    <section
      style={{
        padding: 15,
        borderRadius: 26,
        border: "1px solid rgba(29,78,216,0.16)",
        background:
          "radial-gradient(circle at 92% 8%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.99))",
        boxShadow: "0 18px 38px rgba(15,23,42,0.07)",
        display: "grid",
        gap: 12,
      }}
    >
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
              borderRadius: 18,
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
            borderRadius: 999,
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
        <div
          style={{
            padding: "15px 13px",
            borderRadius: 19,
            border: "1px dashed rgba(29,78,216,0.17)",
            background: "rgba(255,255,255,0.76)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 950, color: CAREER_TEXT }}>
            No hired employee workspace yet
          </div>

          <div style={{ marginTop: 5, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.5 }}>
            Hired candidates will appear here for status, completion, and rating follow-up.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {relevant.map((record) => {
            const actionNeeded = needsAction(record);
            const statusStyle = getStatusStyle(record.status);
            const openTarget = record.careerPostId ?? record.id;

            return (
              <button
                key={record.id}
                type="button"
                onClick={() => onOpenPost(openTarget)}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 21,
                  border: actionNeeded
                    ? "1px solid rgba(29,78,216,0.22)"
                    : "1px solid rgba(29,78,216,0.11)",
                  background: actionNeeded
                    ? "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.98))"
                    : "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
                  boxShadow: actionNeeded
                    ? "0 12px 24px rgba(29,78,216,0.07)"
                    : "0 8px 18px rgba(15,23,42,0.035)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 950,
                        color: CAREER_TEXT,
                        lineHeight: 1.22,
                      }}
                    >
                      {record.employeeName}
                    </div>

                    <div
                      style={{ marginTop: 5, fontSize: 12, color: CAREER_MUTED, lineHeight: 1.42 }}
                    >
                      {record.jobTitle}
                      {record.category ? ` - ${record.category}` : ""}
                    </div>
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 10,
                      fontWeight: 950,
                      padding: "5px 9px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                      ...statusStyle,
                    }}
                  >
                    {getStatusLabel(record.status)}
                  </span>
                </div>

                {record.joinedAt && (
                  <div style={{ marginTop: 7, fontSize: 11, color: CAREER_MUTED, fontWeight: 850 }}>
                    Joined: {formatDate(record.joinedAt)}
                  </div>
                )}

                {record.status === "notice_period" && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 9px",
                      borderRadius: 13,
                      background: "rgba(217,119,6,0.08)",
                      color: "#b45309",
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    Notice period active
                  </div>
                )}

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 950, color: CAREER_BLUE_DEEP }}>
                    {actionNeeded
                      ? "Review required"
                      : record.status !== "exited"
                        ? "Open workspace"
                        : "View record"}
                  </span>

                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: "rgba(29,78,216,0.055)",
                      color: CAREER_BLUE_DEEP,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      fontWeight: 950,
                    }}
                  >
                    ›
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SummaryChip({ label, value, active }: { label: string; value: number; active?: boolean }) {
  const isActive = active ?? value > 0;

  return (
    <div
      style={{
        minWidth: 0,
        padding: "9px 10px",
        borderRadius: 16,
        background: isActive ? "rgba(29,78,216,0.07)" : INACTIVE_BADGE_BG,
        border: isActive ? "1px solid rgba(29,78,216,0.11)" : "1px solid rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED }}>{label}</div>

      <div
        style={{
          marginTop: 4,
          fontSize: 16,
          fontWeight: 950,
          color: isActive ? CAREER_BLUE : INACTIVE_BADGE_TEXT,
        }}
      >
        {value}
      </div>
    </div>
  );
}
