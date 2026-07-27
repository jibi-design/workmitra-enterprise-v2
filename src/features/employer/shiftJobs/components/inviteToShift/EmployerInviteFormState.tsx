// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerInviteFormState.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\inviteToShift\EmployerInviteFormState.tsx

import type { ShiftPost } from "../../storage/employerShift.storage";

type Props = {
  workerName: string;
  selectedPostId: string | null;
  openPosts: ShiftPost[];
  sendError?: string;
  onSelectedPostIdChange: (postId: string) => void;
  onClose: () => void;
  onSend: () => void;
};

export function EmployerInviteFormState({
  workerName,
  selectedPostId,
  openPosts,
  sendError,
  onSelectedPostIdChange,
  onClose,
  onSend,
}: Props) {
  return (
    <>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
        Invite to Shift
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14 }}>
        Select a shift for <strong>{workerName}</strong>
      </div>

      {openPosts.length === 0 ? (
        <div
          style={{
            padding: "16px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "rgba(148,163,184,0.08)",
            border: "1px solid var(--wm-er-border)",
            fontSize: 12,
            color: "var(--wm-er-muted)",
            textAlign: "center",
          }}
        >
          No open shifts available. Create a shift first.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
          {openPosts.map((post) => {
            const isSelected = selectedPostId === post.id;
            const dateText = new Date(post.startAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => onSelectedPostIdChange(post.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--wm-radius-10)",
                  textAlign: "left",
                  border: isSelected
                    ? "1.5px solid var(--wm-er-accent-shift, #16a34a)"
                    : "1px solid var(--wm-er-border)",
                  background: isSelected ? "rgba(22,163,74,0.06)" : "var(--wm-er-bg)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {post.jobName}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {post.locationName} - {dateText} - Pay: {post.payPerDay}/day
                </div>
              </button>
            );
          })}
        </div>
      )}

      {sendError ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.2)",
            fontSize: 12,
            color: "#b91c1c",
          }}
        >
          {sendError}
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--wm-radius-10)",
            border: "1px solid var(--wm-er-border)",
            background: "none",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--wm-er-muted)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!selectedPostId}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--wm-radius-10)",
            border: "none",
            background: selectedPostId ? "var(--wm-er-accent-shift, #16a34a)" : "#e5e7eb",
            color: selectedPostId ? "#fff" : "#9ca3af",
            fontSize: 12,
            fontWeight: 600,
            cursor: selectedPostId ? "pointer" : "not-allowed",
          }}
        >
          Send Invite
        </button>
      </div>
    </>
  );
}
