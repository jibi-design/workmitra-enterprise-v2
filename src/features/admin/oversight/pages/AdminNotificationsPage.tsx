// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminNotificationsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\pages\AdminNotificationsPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { AdminBroadcastModal } from "../components/AdminBroadcastModal";
import { AdminNotificationsHeader } from "../components/AdminNotificationsHeader";
import { AdminNotificationsList } from "../components/AdminNotificationsList";
import {
  AdminNotificationsToolbar,
  type AdminNotificationFilter,
} from "../components/AdminNotificationsToolbar";
import {
  ADMIN_NOTIF_EVENT,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  pushAdminNotification,
  sendBroadcast,
  type AdminNotification,
  type BroadcastTarget,
} from "../helpers/adminActions";

const EVENTS = [ADMIN_NOTIF_EVENT, "storage", "focus"];

let cacheKey = "";
let cacheData: AdminNotification[] = [];

function snap(): AdminNotification[] {
  const raw = localStorage.getItem("wm_admin_notifications_v1") ?? "";

  if (raw === cacheKey) return cacheData;

  cacheKey = raw;
  cacheData = getAdminNotifications();

  return cacheData;
}

function subscribe(callback: () => void): () => void {
  const handler = () => callback();

  for (const eventName of EVENTS) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of EVENTS) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}

function fmtDate(timestamp: number): string {
  if (!timestamp) return "—";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function relTime(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminNotificationsPage() {
  const notifications = useSyncExternalStore(subscribe, snap, snap);

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bcTarget, setBcTarget] = useState<BroadcastTarget>("all");
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");
  const [filter, setFilter] = useState<AdminNotificationFilter>("all");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [notifications, filter]);

  const handleSendBroadcast = useCallback(() => {
    if (!bcTitle.trim()) return;

    sendBroadcast(bcTarget, bcTitle.trim(), bcBody.trim());
    setBcTitle("");
    setBcBody("");
    setShowBroadcast(false);
  }, [bcTarget, bcTitle, bcBody]);

  const handleMarkAllRead = useCallback(() => {
    markAllAdminNotificationsRead();
  }, []);

  return (
    <div className="wm-ad-fadeIn">
      <AdminBroadcastModal
        open={showBroadcast}
        target={bcTarget}
        title={bcTitle}
        body={bcBody}
        onClose={() => setShowBroadcast(false)}
        onTargetChange={setBcTarget}
        onTitleChange={setBcTitle}
        onBodyChange={setBcBody}
        onSend={handleSendBroadcast}
      />

      <AdminNotificationsHeader totalCount={notifications.length} unreadCount={unreadCount} />

      <AdminNotificationsToolbar
        filter={filter}
        unreadCount={unreadCount}
        onFilterChange={setFilter}
        onOpenBroadcast={() => setShowBroadcast(true)}
        onMarkAllRead={handleMarkAllRead}
        onTestAlert={() =>
          pushAdminNotification(
            "system",
            "System check completed",
            "All services operational.",
          )
        }
      />

      <AdminNotificationsList
        notifications={filtered}
        filter={filter}
        onMarkRead={markAdminNotificationRead}
        formatDate={fmtDate}
        relativeTime={relTime}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
