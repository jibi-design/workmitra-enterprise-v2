// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashApplications.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceDashApplications.tsx

import type { CSSProperties } from "react";
import type {
  WorkforceAnnouncement,
  WorkforceApplication,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconStar } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, statusBadgeStyle } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  applications: WorkforceApplication[];
  groupedApplications: Map<string, WorkforceApplication[]>;
  categoryMap: Map<string, string>;
};

const applicantCardStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

function appStatusColor(status: WorkforceApplication["status"]): string {
  switch (status) {
    case "applied":
      return "var(--wm-er-text)";
    case "selected":
      return "var(--wm-success)";
    case "waiting":
      return "var(--wm-warning)";
    case "not_selected":
      return "var(--wm-er-muted)";
    case "confirmed":
      return "var(--wm-success)";
    case "cancelled":
      return "var(--wm-error)";
  }
}

export function EmployerWorkforceAnnounceDashApplications({
  announcement,
  applications,
  groupedApplications,
  categoryMap,
}: Props) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Applications ({applications.length})
      </div>

      {applications.length === 0 ? (
        <div className="wm-er-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>
            No applications yet. Staff will appear here once they respond.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {announcement.targetCategories.map((categoryId) =>
            announcement.shifts.map((shift) => {
              const key = `${categoryId}__${shift.id}`;
              const apps = groupedApplications.get(key) ?? [];
              const vacancy = announcement.vacancyPerCategoryPerShift[categoryId]?.[shift.id] ?? 0;
              const filledCount = apps.filter(
                (app) => app.status === "selected" || app.status === "confirmed",
              ).length;

              return (
                <div key={key} className="wm-er-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>
                        {categoryMap.get(categoryId) ?? categoryId}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 6 }}>
                        · {shift.name}
                      </span>
                    </div>

                    <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                      {filledCount}/{vacancy} filled
                    </span>
                  </div>

                  {apps.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>
                      No applicants
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 6 }}>
                      {apps.map((app) => (
                        <div key={app.id} style={applicantCardStyle}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--wm-er-text)",
                                }}
                              >
                                {app.employeeName}
                                {app.hasDateConflict && (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      color: "var(--wm-warning)",
                                      fontWeight: 800,
                                    }}
                                  >
                                    ⚠ Conflict
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginTop: 2,
                                }}
                              >
                                {app.rating !== null ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                      fontSize: 11,
                                      color: AMBER,
                                      fontWeight: 700,
                                    }}
                                  >
                                    <IconStar /> {app.rating.toFixed(1)}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                                    No rating
                                  </span>
                                )}

                                <span
                                  style={{ ...statusBadgeStyle, color: appStatusColor(app.status) }}
                                >
                                  {app.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
