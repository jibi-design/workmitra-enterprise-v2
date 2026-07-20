// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminNotificationsToolbar.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminNotificationsToolbar.tsx

export type AdminNotificationFilter = "all" | "unread";

type Props = {
  filter: AdminNotificationFilter;
  unreadCount: number;
  onFilterChange: (value: AdminNotificationFilter) => void;
  onOpenBroadcast: () => void;
  onMarkAllRead: () => void;
  onTestAlert: () => void;
};

export function AdminNotificationsToolbar({
  filter,
  unreadCount,
  onFilterChange,
  onOpenBroadcast,
  onMarkAllRead,
  onTestAlert,
}: Props) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="green"
          onClick={onOpenBroadcast}
        >
          Send Broadcast
        </button>

        {unreadCount > 0 && (
          <button
            type="button"
            className="wm-ad-actionBtn"
            data-variant="default"
            onClick={onMarkAllRead}
          >
            Mark All Read
          </button>
        )}

        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="default"
          onClick={onTestAlert}
        >
          Test Alert
        </button>
      </div>

      <div className="wm-ad-filterBar">
        {(["all", "unread"] as AdminNotificationFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            className="wm-ad-filterChip"
            data-active={filter === item}
            onClick={() => onFilterChange(item)}
          >
            {item === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>
    </>
  );
}
