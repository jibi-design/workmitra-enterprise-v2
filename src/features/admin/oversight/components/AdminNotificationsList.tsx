// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminNotificationsList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminNotificationsList.tsx

import type { AdminNotification } from "../helpers/adminActions";
import type { AdminNotificationFilter } from "./AdminNotificationsToolbar";

const KIND_META: Record<string, { label: string; color: string; bg: string }> = {
  system: { label: "SYSTEM", color: "var(--wm-ad-navy-500)", bg: "var(--wm-ad-navy-50)" },
  broadcast_sent: { label: "BROADCAST", color: "var(--wm-ad-green)", bg: "var(--wm-ad-green-dim)" },
  user_action: { label: "USER", color: "#d97706", bg: "rgba(245,158,11,0.08)" },
  alert: { label: "ALERT", color: "var(--wm-ad-danger)", bg: "var(--wm-ad-danger-dim)" },
};

type Props = {
  notifications: AdminNotification[];
  filter: AdminNotificationFilter;
  onMarkRead: (id: string) => void;
  formatDate: (timestamp: number) => string;
  relativeTime: (timestamp: number) => string;
};

export function AdminNotificationsList({
  notifications,
  filter,
  onMarkRead,
  formatDate,
  relativeTime,
}: Props) {
  return (
    <div
      style={{
        background: "var(--wm-ad-white)",
        border: "1px solid var(--wm-ad-border)",
        borderRadius: "var(--wm-ad-r)",
        boxShadow: "var(--wm-ad-sh)",
        overflow: "hidden",
      }}
    >
      {notifications.length === 0 ? (
        <div className="wm-ad-empty">
          {filter === "unread"
            ? "No unread notifications."
            : "No notifications yet. Send a broadcast or trigger a test alert."}
        </div>
      ) : (
        notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onMarkRead={() => onMarkRead(notification.id)}
            formatDate={formatDate}
            relativeTime={relativeTime}
          />
        ))
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: string }) {
  const meta = KIND_META[kind] ?? KIND_META.system;

  return (
    <span
      style={{
        fontSize: 8.5,
        fontWeight: 900,
        padding: "2px 8px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        letterSpacing: 0.6,
        textTransform: "uppercase",
      }}
    >
      {meta.label}
    </span>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  formatDate,
  relativeTime,
}: {
  notification: AdminNotification;
  onMarkRead: () => void;
  formatDate: (timestamp: number) => string;
  relativeTime: (timestamp: number) => string;
}) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--wm-ad-divider)",
        background: notification.isRead ? "transparent" : "rgba(22,163,74,0.03)",
        transition: "background 0.1s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <KindBadge kind={notification.kind} />

          {!notification.isRead && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--wm-ad-green)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}

          <span
            style={{
              fontSize: 13,
              fontWeight: notification.isRead ? 600 : 800,
              color: "var(--wm-ad-navy)",
            }}
          >
            {notification.title}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span
            style={{
              fontSize: 10,
              color: "var(--wm-ad-navy-300)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(notification.createdAt)}
          </span>

          <span style={{ fontSize: 9, color: "var(--wm-ad-navy-300)", fontWeight: 600 }}>
            {relativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {notification.body && (
        <div
          style={{ fontSize: 12, color: "var(--wm-ad-navy-500)", marginTop: 4, lineHeight: 1.55 }}
        >
          {notification.body}
        </div>
      )}

      {!notification.isRead && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={onMarkRead}
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--wm-ad-card-inner)",
              border: "1px solid var(--wm-ad-border)",
              color: "var(--wm-ad-navy-400)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Mark read
          </button>
        </div>
      )}
    </div>
  );
}
