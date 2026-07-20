// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminNotificationsHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminNotificationsHeader.tsx

type Props = {
  totalCount: number;
  unreadCount: number;
};

export function AdminNotificationsHeader({ totalCount, unreadCount }: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}
      >
        Notifications
      </div>

      <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>
        {totalCount} notification{totalCount !== 1 ? "s" : ""}
        {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
      </div>
    </div>
  );
}
