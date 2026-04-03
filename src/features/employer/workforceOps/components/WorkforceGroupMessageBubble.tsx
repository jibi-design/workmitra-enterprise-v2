// src/features/employer/workforceOps/components/WorkforceGroupMessageBubble.tsx
//
// Reusable chat message bubble for Workforce group communication.

import type { WorkforceMessage } from "../types/workforceTypes";
import { AMBER } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  message: WorkforceMessage;
  isOwn: boolean;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Time Formatter                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function WorkforceGroupMessageBubble({ message, isOwn }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        padding: "2px 0",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: isOwn ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
          background: isOwn ? AMBER : "var(--wm-er-bg)",
          color: isOwn ? "#fff" : "var(--wm-er-text)",
        }}
      >
        {/* Sender name (for others) */}
        {!isOwn && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: isOwn ? "rgba(255,255,255,0.8)" : AMBER,
              marginBottom: 2,
            }}
          >
            {message.senderName}
          </div>
        )}

        {/* Urgent tag */}
        {message.isUrgent && (
          <span
            style={{
              display: "inline-block",
              padding: "1px 6px",
              borderRadius: 4,
              background: isOwn ? "rgba(255,255,255,0.2)" : "rgba(220,38,38,0.1)",
              color: isOwn ? "#fff" : "var(--wm-error)",
              fontSize: 9,
              fontWeight: 900,
              marginBottom: 4,
            }}
          >
            URGENT
          </span>
        )}

        {/* Message text */}
        <div style={{ fontSize: 13, lineHeight: 1.45, wordBreak: "break-word" }}>
          {message.text}
        </div>

        {/* Time */}
        <div
          style={{
            fontSize: 9,
            color: isOwn ? "rgba(255,255,255,0.6)" : "var(--wm-er-muted)",
            marginTop: 3,
            textAlign: "right",
          }}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}