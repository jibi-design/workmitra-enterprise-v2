// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspacesPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerWorkspacesPage.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTask,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import type { CareerWorkspace } from "../../../employer/careerJobs/types/careerTypes";
import {
  CAREER_WORKSPACES_CHANGED,
  CAREER_WORKSPACES_KEY,
  safeParse,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

let cacheRaw: string | null = "__init__";
let cacheList: CareerWorkspace[] = [];

function getSnapshot(): CareerWorkspace[] {
  const raw = localStorage.getItem(CAREER_WORKSPACES_KEY);

  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = safeParse<CareerWorkspace>(raw)
      .filter(
        (workspace): workspace is CareerWorkspace =>
          typeof workspace === "object" &&
          workspace !== null &&
          typeof (workspace as CareerWorkspace).id === "string" &&
          typeof (workspace as CareerWorkspace).jobId === "string",
      )
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }

  return cacheList;
}

function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  const events = ["storage", "focus", CAREER_WORKSPACES_CHANGED];

  for (const eventName of events) window.addEventListener(eventName, handler);
  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of events) window.removeEventListener(eventName, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

function getFeedbackSnapshot(): string {
  return JSON.stringify(careerEmploymentFeedbackStorage.getAll());
}

function parseFeedbackTasks(raw: string): CareerEmploymentFeedbackTask[] {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hasCompletedFeedbackForJob(
  tasks: CareerEmploymentFeedbackTask[],
  careerPostId: string,
): boolean {
  return tasks.some(
    (task) =>
      task.careerPostId === careerPostId &&
      task.state === "completed" &&
      Array.isArray(task.selectedTags) &&
      task.selectedTags.length > 0,
  );
}

function fmtDateTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

type BadgeTone = "career" | "neutral" | "bad";

function statusTone(status: string): BadgeTone {
  if (status === "terminated") return "bad";
  if (status === "completed") return "neutral";
  return "career";
}

function statusLabel(status: string): string {
  if (status === "onboarding" || status === "active") return "Currently Working";
  if (status === "completed") return "Completed";
  if (status === "terminated") return "Terminated";
  return status;
}

function toneBadgeStyle(tone: BadgeTone): React.CSSProperties {
  if (tone === "career") {
    return {
      border: "1px solid rgba(29,78,216,0.20)",
      background: "rgba(29,78,216,0.08)",
      color: CAREER_BLUE_DEEP,
    };
  }

  if (tone === "bad") {
    return {
      border: "1px solid rgba(220,38,38,0.24)",
      background: "rgba(254,242,242,0.95)",
      color: "#dc2626",
    };
  }

  return {
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(248,250,252,0.96)",
    color: CAREER_MUTED,
  };
}

function updateLabel(count: number): string {
  return `${count} update${count === 1 ? "" : "s"}`;
}

export function EmployeeCareerWorkspacesPage() {
  const nav = useNavigate();
  const workspaces = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    getFeedbackSnapshot,
    getFeedbackSnapshot,
  );

  const feedbackTasks = useMemo(() => parseFeedbackTasks(feedbackRaw), [feedbackRaw]);

  function openWorkspace(workspaceId: string) {
    nav(ROUTE_PATHS.employeeCareerWorkspace.replace(":workspaceId", workspaceId));
  }

  return (
    <div>
      <section
        style={{
          marginTop: 2,
          padding: "17px 15px",
          borderRadius: 28,
          border: "1px solid rgba(29,78,216,0.18)",
          background:
            "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.14), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 52%, rgba(239,246,255,0.84))",
          boxShadow: "0 18px 38px rgba(15,23,42,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              flexShrink: 0,
              background: "rgba(29,78,216,0.09)",
              border: "1px solid rgba(29,78,216,0.14)",
              color: CAREER_BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                width: "fit-content",
                padding: "4px 9px",
                borderRadius: 999,
                background: "rgba(29,78,216,0.08)",
                border: "1px solid rgba(29,78,216,0.12)",
                color: CAREER_BLUE,
                fontSize: 10.5,
                fontWeight: 950,
                letterSpacing: 0.7,
                textTransform: "uppercase",
              }}
            >
              Career Workspaces
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 20,
                fontWeight: 950,
                color: CAREER_TEXT,
                lineHeight: 1.18,
              }}
            >
              Career employment workspaces
            </div>

            <div style={{ marginTop: 6, fontSize: 12.5, color: CAREER_MUTED, lineHeight: 1.55 }}>
              Open active and completed Career work records, feedback, and saved updates.
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 12, display: "grid", gap: 10, marginBottom: 24 }}>
        {workspaces.length === 0 && (
          <div
            style={{
              padding: "28px 22px",
              borderRadius: 24,
              border: "1px solid rgba(203,213,225,0.95)",
              background:
                "radial-gradient(circle at 50% 0%, rgba(29,78,216,0.1), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 58%, rgba(239,246,255,0.76))",
              boxShadow: "0 16px 34px rgba(15,23,42,0.07)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto",
                borderRadius: 18,
                background: "rgba(29,78,216,0.09)",
                border: "1px solid rgba(29,78,216,0.13)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: CAREER_BLUE,
              }}
            >
              <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
                />
              </svg>
            </div>

            <div style={{ marginTop: 13, fontSize: 15, fontWeight: 950, color: CAREER_TEXT }}>
              No workspace yet
            </div>

            <div style={{ marginTop: 7, fontSize: 13, color: CAREER_MUTED, lineHeight: 1.58 }}>
              When an employer confirms you for a Career Job, your workspace will appear here.
            </div>

            <div
              style={{
                marginTop: 13,
                padding: "9px 11px",
                borderRadius: 15,
                background: "rgba(29,78,216,0.055)",
                color: CAREER_BLUE_DEEP,
                fontSize: 11.5,
                fontWeight: 850,
                lineHeight: 1.45,
              }}
            >
              Career workspaces stay separate from Shift Jobs.
            </div>
          </div>
        )}

        {workspaces.map((workspace) => {
          const tone = statusTone(workspace.status);
          const updatesCount = workspace.updates.length;
          const hasWorkFeedback = hasCompletedFeedbackForJob(feedbackTasks, workspace.jobId);

          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => openWorkspace(workspace.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 15,
                borderRadius: 24,
                border: "1px solid rgba(29,78,216,0.13)",
                background:
                  "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.08), transparent 30%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
                boxShadow: "0 14px 30px rgba(15,23,42,0.065)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 16,
                  bottom: 16,
                  width: 4,
                  borderRadius: "0 999px 999px 0",
                  background: CAREER_BLUE,
                }}
              />

              <div style={{ paddingLeft: 5 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 950,
                        color: CAREER_TEXT,
                        lineHeight: 1.25,
                      }}
                    >
                      {workspace.jobTitle}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12.5,
                        fontWeight: 900,
                        color: CAREER_TEXT,
                        lineHeight: 1.35,
                      }}
                    >
                      {workspace.companyName}
                      {workspace.department ? ` - ${workspace.department}` : ""}
                    </div>
                  </div>

                  <span
                    style={{
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 10.5,
                      fontWeight: 950,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      ...toneBadgeStyle(tone),
                    }}
                  >
                    {statusLabel(workspace.status)}
                  </span>
                </div>

                {workspace.location && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "inline-flex",
                      maxWidth: "100%",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(29,78,216,0.055)",
                      border: "1px solid rgba(29,78,216,0.09)",
                      color: CAREER_BLUE,
                      fontSize: 11.5,
                      fontWeight: 850,
                      lineHeight: 1.25,
                    }}
                  >
                    {workspace.location}
                  </div>
                )}

                {hasWorkFeedback && (
                  <div
                    style={{
                      marginTop: 9,
                      display: "inline-flex",
                      alignItems: "center",
                      width: "fit-content",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.08)",
                      border: "1px solid rgba(22,163,74,0.16)",
                      color: "#15803d",
                      fontSize: 11.3,
                      fontWeight: 950,
                    }}
                  >
                    Work feedback available
                  </div>
                )}

                <div
                  style={{
                    marginTop: 11,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(148,163,184,0.14)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 11.5, color: CAREER_MUTED, fontWeight: 750 }}>
                    Hired {fmtDateTime(workspace.hiredAt)}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {updatesCount > 0 && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 950,
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "rgba(29,78,216,0.09)",
                          border: "1px solid rgba(29,78,216,0.14)",
                          color: CAREER_BLUE_DEEP,
                        }}
                      >
                        {updateLabel(updatesCount)}
                      </span>
                    )}

                    <span
                      style={{
                        minHeight: 28,
                        padding: "0 12px",
                        borderRadius: 999,
                        display: "inline-flex",
                        alignItems: "center",
                        background: CAREER_BLUE,
                        color: "#ffffff",
                        fontSize: 11.5,
                        fontWeight: 950,
                        boxShadow: "0 8px 18px rgba(29,78,216,0.16)",
                      }}
                    >
                      Open
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
