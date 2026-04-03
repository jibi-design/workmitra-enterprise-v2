// src/shared/components/notifications/NotificationEmptyState.tsx
//
// Shared empty state for notification pages (Employer + Employee).
// Positioned below filter tabs with padding-top: 40px.

import { NOTIFICATION_CYAN, BELL_CIRCLE_BG } from "./notificationTypes";

/* ------------------------------------------------ */
/* Bell SVG                                         */
/* ------------------------------------------------ */
function BellIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path
        fill={NOTIFICATION_CYAN}
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NotificationEmptyState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      textAlign: "center",
      padding: "40px 24px 24px",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: BELL_CIRCLE_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <BellIcon />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>
        No notifications yet
      </div>
      <div style={{
        fontSize: 13,
        color: "var(--wm-er-muted, #64748b)",
        lineHeight: 1.5,
        maxWidth: 280,
      }}>
        When there's something new, you'll see it here
      </div>
    </div>
  );
}