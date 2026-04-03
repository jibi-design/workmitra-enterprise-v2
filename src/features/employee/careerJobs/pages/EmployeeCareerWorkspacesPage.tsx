// src/features/employee/careerJobs/pages/EmployeeCareerWorkspacesPage.tsx
//
// List all career workspaces (hired positions).
// Indigo accent (career domain).

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import type { CareerWorkspace } from "../../../employer/careerJobs/types/careerTypes";

import {
  CAREER_WORKSPACES_KEY,
  CAREER_WORKSPACES_CHANGED,
  safeParse,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot + Subscribe
// ─────────────────────────────────────────────────────────────────────────────

let cacheRaw: string | null = "__init__";
let cacheList: CareerWorkspace[] = [];

function getSnapshot(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = safeParse<CareerWorkspace>(raw)
      .filter(
        (w): w is CareerWorkspace =>
          typeof w === "object" &&
          w !== null &&
          typeof (w as CareerWorkspace).id === "string" &&
          typeof (w as CareerWorkspace).jobId === "string",
      )
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }
  return cacheList;
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", CAREER_WORKSPACES_CHANGED];
  for (const ev of events) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    for (const ev of events) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Display Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

type BadgeTone = "good" | "neutral" | "warn" | "bad";

function statusTone(s: string): BadgeTone {
  if (s === "active" || s === "onboarding") return "good";
  if (s === "completed") return "neutral";
  if (s === "terminated") return "bad";
  return "neutral";
}

function statusLabel(s: string): string {
  if (s === "onboarding") return "Onboarding";
  if (s === "active") return "Active";
  if (s === "completed") return "Completed";
  if (s === "terminated") return "Terminated";
  return s;
}

function toneBadgeStyle(tone: BadgeTone): React.CSSProperties {
  if (tone === "good") return { border: "1px solid rgba(22,163,74,0.30)", background: "rgba(22,163,74,0.10)", color: "#166534" };
  if (tone === "warn") return { border: "1px solid rgba(217,119,6,0.30)", background: "rgba(217,119,6,0.10)", color: "#92400e" };
  if (tone === "bad") return { border: "1px solid rgba(220,38,38,0.30)", background: "rgba(220,38,38,0.10)", color: "#991b1b" };
  return { border: "1px solid rgba(17,24,39,0.10)", background: "rgba(17,24,39,0.04)", color: "var(--wm-emp-muted, #6b7280)" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmployeeCareerWorkspacesPage() {
  const nav = useNavigate();
  const workspaces = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function openWorkspace(wsId: string) {
    nav(ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", wsId));
  }

  return (
    <div>
      {/* Page Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">My Workspaces</div>
          <div className="wm-pageSub">Onboarding and communication for hired positions.</div>
        </div>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={() => nav(ROUTE_PATHS.employeeCareerHome)}
          style={{ fontSize: 12 }}
        >
          Career Home
        </button>
      </div>

      {/* Workspace List */}
      <div style={{ marginTop: 12, display: "grid", gap: 10, marginBottom: 24 }}>
        {workspaces.length === 0 && (
          <div className="wm-ee-card" style={{ textAlign: "center", padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-emp-text, #111827)" }}>
              No workspaces yet
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 6, lineHeight: 1.5 }}>
              When you get hired for a career position, your workspace will appear here.
            </div>
          </div>
        )}

        {workspaces.map((ws) => {
          const tone = statusTone(ws.status);
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => openWorkspace(ws.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(29,78,216,0.12)",
                background: "var(--wm-emp-surface, #fff)",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              {/* Title + Status Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 1000, color: "var(--wm-er-accent-career)" }}>
                  {ws.jobTitle}
                </div>
                <span
                  style={{
                    height: 24,
                    padding: "0 10px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 900,
                    flexShrink: 0,
                    ...toneBadgeStyle(tone),
                  }}
                >
                  {statusLabel(ws.status)}
                </span>
              </div>

              {/* Company + Details */}
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, #111827)", marginTop: 4 }}>
                {ws.companyName}
                {ws.department ? ` — ${ws.department}` : ""}
              </div>
              {ws.location && (
                <div style={{ fontSize: 11, color: "var(--wm-emp-muted, #6b7280)", marginTop: 2 }}>
                  {ws.location}
                </div>
              )}

              {/* Footer */}
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, color: "var(--wm-emp-muted, #6b7280)" }}>
                  Hired {fmtDateTime(ws.hiredAt)}
                </div>
                {ws.unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--wm-er-accent-career)",
                      color: "#fff",
                    }}
                  >
                    {ws.unreadCount} new
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-accent-career)" }}>
                  Open ›
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}