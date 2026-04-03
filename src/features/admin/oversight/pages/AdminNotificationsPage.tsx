// src/features/admin/oversight/pages/AdminNotificationsPage.tsx
//
// Admin Notifications Center — notification list + global broadcast.
// Phase-0 localStorage. v5 light premium theme.

import { useState, useMemo, useSyncExternalStore, useCallback } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import {
  getAdminNotifications,
  pushAdminNotification,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  sendBroadcast,
  ADMIN_NOTIF_EVENT,
  type AdminNotification,
  type BroadcastTarget,
} from "../helpers/adminActions";

// ─────────────────────────────────────────────────────────────────────────────
// Reactive Snapshot
// ─────────────────────────────────────────────────────────────────────────────

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

function subscribe(cb: () => void): () => void {
  const h = () => cb();
  for (const ev of EVENTS) window.addEventListener(ev, h);
  document.addEventListener("visibilitychange", h);
  return () => {
    for (const ev of EVENTS) window.removeEventListener(ev, h);
    document.removeEventListener("visibilitychange", h);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(ts: number): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function relTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Kind Badge
// ─────────────────────────────────────────────────────────────────────────────

const KIND_META: Record<string, { label: string; color: string; bg: string }> = {
  system: { label: "SYSTEM", color: "var(--wm-ad-navy-500)", bg: "var(--wm-ad-navy-50)" },
  broadcast_sent: { label: "BROADCAST", color: "var(--wm-ad-green)", bg: "var(--wm-ad-green-dim)" },
  user_action: { label: "USER", color: "#d97706", bg: "rgba(245,158,11,0.08)" },
  alert: { label: "ALERT", color: "var(--wm-ad-danger)", bg: "var(--wm-ad-danger-dim)" },
};

function KindBadge({ kind }: { kind: string }) {
  const meta = KIND_META[kind] ?? KIND_META["system"];
  return (
    <span
      style={{
        fontSize: 8.5, fontWeight: 900, padding: "2px 8px", borderRadius: 999,
        background: meta.bg, color: meta.color,
        letterSpacing: 0.6, textTransform: "uppercase",
      }}
    >
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminNotificationsPage() {
  const notifications = useSyncExternalStore(subscribe, snap, snap);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bcTarget, setBcTarget] = useState<BroadcastTarget>("all");
  const [bcTitle, setBcTitle] = useState("");
  const [bcBody, setBcBody] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
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
      {/* Broadcast Modal */}
      <CenterModal open={showBroadcast} onBackdropClose={() => setShowBroadcast(false)} ariaLabel="Send Broadcast">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-ad-navy)" }}>Send Broadcast</div>
          <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", marginTop: 4, lineHeight: 1.5 }}>
            Send a notification to selected user groups. Phase-0: stored in their notification list.
          </div>

          {/* Target */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-ad-navy-400)", marginBottom: 8 }}>Send to</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["all", "employers", "employees"] as BroadcastTarget[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="wm-ad-filterChip"
                  data-active={bcTarget === t}
                  onClick={() => setBcTarget(t)}
                >
                  {t === "all" ? "All Users" : t === "employers" ? "Employers" : "Employees"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-ad-navy-400)", marginBottom: 6 }}>Title (required)</div>
            <input
              type="text"
              value={bcTitle}
              onChange={(e) => setBcTitle(e.target.value)}
              placeholder="Notification title..."
              maxLength={100}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, fontWeight: 600,
                border: "1px solid var(--wm-ad-border)", borderRadius: 10,
                background: "var(--wm-ad-card-inner)", color: "var(--wm-ad-navy)",
                outline: "none", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Body */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-ad-navy-400)", marginBottom: 6 }}>Message (optional)</div>
            <textarea
              value={bcBody}
              onChange={(e) => setBcBody(e.target.value)}
              placeholder="Additional details..."
              maxLength={300}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 13, fontWeight: 600,
                border: "1px solid var(--wm-ad-border)", borderRadius: 10,
                background: "var(--wm-ad-card-inner)", color: "var(--wm-ad-navy)",
                resize: "vertical", minHeight: 60, outline: "none", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={() => setShowBroadcast(false)} style={{ fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 10, border: "1px solid var(--wm-ad-border)", background: "var(--wm-ad-white)", color: "var(--wm-ad-navy)", cursor: "pointer" }}>Cancel</button>
            <button
              type="button"
              disabled={!bcTitle.trim()}
              onClick={handleSendBroadcast}
              style={{
                fontSize: 13, fontWeight: 900, padding: "8px 20px", borderRadius: 10, border: "none",
                background: "var(--wm-ad-green)", color: "#fff", cursor: "pointer",
                opacity: !bcTitle.trim() ? 0.4 : 1,
              }}
            >
              Send Broadcast
            </button>
          </div>
        </div>
      </CenterModal>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}>Notifications</div>
        <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <button type="button" className="wm-ad-actionBtn" data-variant="green" onClick={() => setShowBroadcast(true)}>
          Send Broadcast
        </button>
        {unreadCount > 0 && (
          <button type="button" className="wm-ad-actionBtn" data-variant="default" onClick={handleMarkAllRead}>
            Mark All Read
          </button>
        )}
        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="default"
          onClick={() => pushAdminNotification("system", "System check completed", "All services operational. Phase-0 localStorage mode.")}
        >
          Test Alert
        </button>
      </div>

      {/* Filter */}
      <div className="wm-ad-filterBar">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className="wm-ad-filterChip"
            data-active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ background: "var(--wm-ad-white)", border: "1px solid var(--wm-ad-border)", borderRadius: "var(--wm-ad-r)", boxShadow: "var(--wm-ad-sh)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="wm-ad-empty">
            {filter === "unread" ? "No unread notifications." : "No notifications yet. Send a broadcast or trigger a test alert."}
          </div>
        ) : (
          filtered.map((n) => (
            <NotifRow key={n.id} notif={n} onMarkRead={() => markAdminNotificationRead(n.id)} />
          ))
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Row
// ─────────────────────────────────────────────────────────────────────────────

function NotifRow({ notif, onMarkRead }: { notif: AdminNotification; onMarkRead: () => void }) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--wm-ad-divider)",
        background: notif.isRead ? "transparent" : "rgba(22,163,74,0.03)",
        transition: "background 0.1s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <KindBadge kind={notif.kind} />
          {!notif.isRead && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--wm-ad-green)", display: "inline-block", flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 13, fontWeight: notif.isRead ? 600 : 800, color: "var(--wm-ad-navy)" }}>
            {notif.title}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontSize: 10, color: "var(--wm-ad-navy-300)", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtDate(notif.createdAt)}</span>
          <span style={{ fontSize: 9, color: "var(--wm-ad-navy-300)", fontWeight: 600 }}>{relTime(notif.createdAt)}</span>
        </div>
      </div>
      {notif.body && (
        <div style={{ fontSize: 12, color: "var(--wm-ad-navy-500)", marginTop: 4, lineHeight: 1.55 }}>
          {notif.body}
        </div>
      )}
      {!notif.isRead && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={onMarkRead}
            style={{
              fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 6,
              background: "var(--wm-ad-card-inner)", border: "1px solid var(--wm-ad-border)",
              color: "var(--wm-ad-navy-400)", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            Mark read
          </button>
        </div>
      )}
    </div>
  );
}