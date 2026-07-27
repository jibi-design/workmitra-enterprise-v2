// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeMyCurrentJobCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeMyCurrentJobCard.tsx

import { useSyncExternalStore } from "react";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import {
  getCareerWorkspacesSnapshot,
  subscribeCareerWorkspaces,
} from "../helpers/careerWorkspaceHooks";

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e40af";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #475569)";

function WorkspaceIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function isActiveWorkspace(workspace: CareerWorkspace): boolean {
  return workspace.status === "onboarding" || workspace.status === "active";
}

function getWorkspaceStatusLabel(status: CareerWorkspace["status"]): string {
  if (status === "onboarding") return "Onboarding";
  if (status === "active") return "Currently Working";
  if (status === "completed") return "Completed";
  if (status === "terminated") return "Terminated";
  return "Workspace";
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

export function EmployeeMyCurrentJobCard({ onOpen }: { onOpen: () => void }) {
  const workspaces = useSyncExternalStore(
    subscribeCareerWorkspaces,
    getCareerWorkspacesSnapshot,
    getCareerWorkspacesSnapshot,
  );

  const activeWorkspaces = workspaces.filter(isActiveWorkspace);
  const hasActiveRecords = activeWorkspaces.length > 0;

  return (
    <section>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "var(--wm-space-10)",
          padding: "0 4px",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: CAREER_TEXT }}>
            Current career workspace
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: CAREER_MUTED, fontWeight: 500 }}>
            Career Jobs only. Shift work stays separate.
          </div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: "var(--wm-radius-employee-card)",
            background: hasActiveRecords ? "rgba(37, 99, 235, 0.08)" : "rgba(15, 23, 42, 0.04)",
            color: hasActiveRecords ? CAREER_BLUE_DEEP : CAREER_MUTED,
            fontSize: 11,
            fontWeight: 700,
            border: hasActiveRecords
              ? "1px solid rgba(37, 99, 235, 0.12)"
              : "1px solid transparent",
          }}
        >
          {activeWorkspaces.length} active
        </div>
      </div>

      {activeWorkspaces.length === 0 ? (
        <div
          className="wm-ee-card wm-career-card"
          style={{
            padding: 18,
            borderRadius: "var(--wm-radius-employer-card)",
            background: "rgba(255, 255, 255, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.03)",
            backdropFilter: "blur(12px)",
            display: "flex",
            gap: "var(--wm-space-14)",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "var(--wm-radius-chip)",
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              color: CAREER_BLUE,
              border: "1px solid rgba(255, 255, 255, 0.8)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.08)",
            }}
          >
            <WorkspaceIcon />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: CAREER_TEXT }}>
              No active workspace yet
            </div>

            <div
              style={{
                fontSize: 12.5,
                color: CAREER_MUTED,
                marginTop: 6,
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Your hired Career workspace will appear here after selection and employer
              confirmation.
            </div>

            <div
              style={{
                marginTop: "var(--wm-space-12)",
                padding: "10px 12px",
                borderRadius: "var(--wm-radius-button)",
                background: "rgba(37, 99, 235, 0.05)",
                color: CAREER_BLUE_DEEP,
                fontSize: 11.5,
                fontWeight: 600,
                border: "1px solid rgba(37, 99, 235, 0.08)",
              }}
            >
              Career work records stay separate from Shift Jobs.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--wm-space-12)" }}>
          {activeWorkspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={onOpen}
              style={{
                width: "100%",
                padding: 18,
                borderRadius: "var(--wm-radius-employer-card)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.7))",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                backdropFilter: "blur(12px)",
                cursor: "pointer",
                textAlign: "left",
                transition: "transform 0.1s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "var(--wm-space-12)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 16, fontWeight: 800, color: CAREER_TEXT, lineHeight: 1.2 }}
                  >
                    {workspace.jobTitle}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: CAREER_MUTED,
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}
                  >
                    {workspace.companyName}
                    {workspace.department ? ` • ${workspace.department}` : ""}
                  </div>
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: "var(--wm-radius-employee-card)",
                    color: CAREER_BLUE_DEEP,
                    background: "rgba(37, 99, 235, 0.08)",
                    border: "1px solid rgba(37, 99, 235, 0.1)",
                  }}
                >
                  {getWorkspaceStatusLabel(workspace.status)}
                </span>
              </div>

              <div
                style={{
                  marginTop: "var(--wm-stack-gap)",
                  display: "grid",
                  gridTemplateColumns: workspace.hiredAt ? "1fr 1fr" : "1fr",
                  gap: "var(--wm-space-10)",
                }}
              >
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "var(--wm-radius-button)",
                    background: "rgba(37, 99, 235, 0.05)",
                    color: CAREER_BLUE_DEEP,
                    fontSize: 11.5,
                    fontWeight: 600,
                    textAlign: "center",
                    border: "1px solid rgba(37, 99, 235, 0.08)",
                  }}
                >
                  Career workspace
                </div>

                {workspace.hiredAt && (
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "var(--wm-radius-button)",
                      background: "rgba(15, 23, 42, 0.03)",
                      color: CAREER_MUTED,
                      fontSize: 11.5,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Hired: {formatDate(workspace.hiredAt)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
