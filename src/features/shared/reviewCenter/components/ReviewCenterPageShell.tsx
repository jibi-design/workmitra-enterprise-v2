// App name: Job Mitra
// File name: ReviewCenterPageShell.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\components\ReviewCenterPageShell.tsx

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getReviewCenterTheme,
  getReviewCenterTitle,
  getReviewRequestBody,
  getReviewRequestLabel,
} from "../helpers/reviewCenter.helpers";
import { reviewCenterStorage } from "../storage/reviewCenter.storage";
import type { ReviewCenterRequest, ReviewRole } from "../types/reviewCenter.types";
import { shiftWorkspacesStorage } from "../../../employee/shiftJobs/storage/shiftWorkspaces.storage";
import { shiftApplicationsStorage } from "../../../employee/shiftJobs/storage/shiftApplications.storage";
import { isPlannerWorkspace } from "../../../employee/planner/helpers/plannerDomainFilters";

type ReviewCenterPageShellProps = {
  role: ReviewRole;
  hasExtraContent?: boolean;
  children?: ReactNode;
};

export function ReviewCenterPageShell({
  role,
  hasExtraContent = false,
  children,
}: ReviewCenterPageShellProps) {
  const [requests, setRequests] = useState(() => reviewCenterStorage.getActiveForRole(role));

  useEffect(() => {
    return reviewCenterStorage.subscribe(() => {
      setRequests(reviewCenterStorage.getActiveForRole(role));
    });
  }, [role]);

  return (
    <div className="wm-reviewCenterShell" style={{ paddingBottom: 24 }}>
      <section
        style={{
          marginTop: 2,
          padding: "16px 16px",
          borderRadius: 22,
          border: "1px solid rgba(148,163,184,0.22)",
          background:
            "linear-gradient(135deg, rgba(148,163,184,0.08), rgba(255,255,255,0.98) 48%, rgba(248,250,252,0.92))",
          boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
        }}
      >
        <div
          style={{ fontSize: 18, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.25 }}
        >
          {getReviewCenterTitle(role)}
        </div>

        <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          Manage completed work reviews and rating requests from one place.
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "9px 11px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(226,232,240,0.9)",
            fontSize: 11,
            fontWeight: 750,
            color: "var(--wm-er-muted)",
            lineHeight: 1.45,
          }}
        >
          Review requests are reminders only. Final ratings must be given honestly after checking
          the completed work.
        </div>
      </section>

      {children}

      <section style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {requests.length === 0 && !hasExtraContent ? (
          <EmptyState role={role} />
        ) : (
          requests.map((request) => <ReviewRequestCard key={request.id} request={request} />)
        )}
      </section>
    </div>
  );
}

function EmptyState({ role }: { role: ReviewRole }) {
  return (
    <div
      className={role === "employee" ? "wm-ee-card" : "wm-er-card"}
      style={{
        padding: "24px 18px",
        borderRadius: 22,
        textAlign: "center",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 950, color: "var(--wm-er-text)" }}>
        No review requests yet
      </div>

      <div style={{ marginTop: 7, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Completed shift or career work reviews will appear here when action is needed.
      </div>
    </div>
  );
}

function ReviewRequestCard({ request }: { request: ReviewCenterRequest }) {
  const nav = useNavigate();
  const theme = getReviewCenterTheme(request.domain);
  const targetPath = getRequestTargetPath(request);
  const canOpen = Boolean(targetPath);

  function openRequest() {
    if (!targetPath) return;

    reviewCenterStorage.markSeen(request.id);
    nav(targetPath);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRequest();
    }
  }

  return (
    <article
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onClick={openRequest}
      onKeyDown={handleKeyDown}
      style={{
        padding: 14,
        borderRadius: 20,
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${theme.accent}`,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
        cursor: canOpen ? "pointer" : "default",
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
            style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.3 }}
          >
            {getReviewRequestLabel(request.action)}
          </div>

          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {request.sourceTitle}
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
          {theme.label}
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
        {getReviewRequestBody(request.action)}
      </div>

      {canOpen && (
        <div style={{ marginTop: 11, display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, fontWeight: 950, color: theme.accent }}>
            Open work group
          </span>
        </div>
      )}
    </article>
  );
}

function getRequestTargetPath(request: ReviewCenterRequest): string | null {
  if (request.domain !== "shift") return null;

  if (request.toRole === "employee") {
    const workspace = shiftWorkspacesStorage.getById(request.sourceId);
    const apps = shiftApplicationsStorage.getApps();
    const path =
      workspace && isPlannerWorkspace(workspace, apps)
        ? ROUTE_PATHS.employeePlannerWorkspace
        : ROUTE_PATHS.employeeShiftWorkspace;

    return path.replace(":workspaceId", request.sourceId);
  }

  if (request.toRole === "employer") {
    return ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", request.sourceId);
  }

  return null;
}
