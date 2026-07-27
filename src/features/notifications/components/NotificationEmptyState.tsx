/** Job Mitra | NotificationEmptyState.tsx | Shared premium empty state */

function BellIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="wm-notificationEmptyBell"
    >
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

export function NotificationEmptyState() {
  return (
    <div className="wm-notificationEmptyState">
      <div className="wm-notificationEmptyIcon">
        <BellIcon />
      </div>
      <div className="wm-notificationEmptyTitle">All caught up!</div>
      <div className="wm-notificationEmptyText">No new notifications</div>
    </div>
  );
}
