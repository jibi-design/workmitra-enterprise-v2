// App name: Job Mitra
// File name: EmployeeShiftReviewActions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\components\EmployeeShiftReviewActions.tsx

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getReviewCenterTheme } from "../helpers/reviewCenter.helpers";
import { reviewCenterStorage } from "../storage/reviewCenter.storage";
import type { EmployeeShiftReviewItem } from "../adapters/employeeShiftReviewCenter.adapter";

type EmployeeShiftReviewActionsProps = {
  items: EmployeeShiftReviewItem[];
};

export function EmployeeShiftReviewActions({ items }: EmployeeShiftReviewActionsProps) {
  const nav = useNavigate();
  const requests = useSyncExternalStore(
    reviewCenterStorage.subscribe,
    reviewCenterStorage.getAll,
    reviewCenterStorage.getAll,
  );

  if (items.length === 0) return null;

  const theme = getReviewCenterTheme("shift");

  return (
    <section style={{ marginTop: 12, display: "grid", gap: 12 }}>
      {items.map((item) => {
        const requestSent = requests.some(
          (request) =>
            request.domain === "shift" &&
            request.sourceId === item.workspaceId &&
            request.action === "employee_request_employer_rating" &&
            request.status === "active",
        );

        return (
          <article
            key={item.workspaceId}
            style={{
              padding: 14,
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              borderLeft: `4px solid ${theme.accent}`,
              background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
              boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 950,
                    color: "var(--wm-er-text)",
                    lineHeight: 1.3,
                  }}
                >
                  Rate employer pending
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 12,
                    color: "var(--wm-er-muted)",
                    lineHeight: 1.45,
                  }}
                >
                  {item.sourceTitle}
                </div>
              </div>

              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: theme.softBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.accent,
                  fontSize: 10,
                  fontWeight: 950,
                  whiteSpace: "nowrap",
                }}
              >
                Shift Jobs
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "var(--wm-er-muted)",
                lineHeight: 1.5,
                fontWeight: 650,
              }}
            >
              Rate the employer and optionally request the employer to review your completed work.
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={() =>
                  nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", item.workspaceId))
                }
                style={{
                  padding: "10px 10px",
                  borderRadius: 12,
                  border: "none",
                  background: theme.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 950,
                  cursor: "pointer",
                  boxShadow: "0 10px 22px rgba(22,163,74,0.16)",
                }}
              >
                Rate Employer
              </button>

              <button
                type="button"
                disabled={requestSent}
                onClick={() =>
                  reviewCenterStorage.createRequest({
                    domain: "shift",
                    sourceId: item.workspaceId,
                    sourceTitle: item.sourceTitle,
                    fromRole: "employee",
                    toRole: "employer",
                    action: "employee_request_employer_rating",
                  })
                }
                style={{
                  padding: "10px 10px",
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background: requestSent ? "rgba(148,163,184,0.16)" : "#fff",
                  color: requestSent ? "var(--wm-er-muted)" : theme.accent,
                  fontSize: 12,
                  fontWeight: 950,
                  cursor: requestSent ? "not-allowed" : "pointer",
                }}
              >
                {requestSent ? "Request Sent" : "Request Rating"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
