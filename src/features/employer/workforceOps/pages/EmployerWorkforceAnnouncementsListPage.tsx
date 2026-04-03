// src/features/employer/workforceOps/pages/EmployerWorkforceAnnouncementsListPage.tsx
//
// Workforce Ops Hub — Announcements List Page.
// Tabs: Open (open + analyzing) | Confirmed | Completed (completed + cancelled).
// "New Announcement" button navigates to create page.

import { useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type {
  WorkforceAnnouncement,
  AnnouncementStatus,
} from "../types/workforceTypes";
import {
  WF_ANNOUNCEMENTS_CHANGED,
  WF_CATEGORIES_CHANGED,
} from "../helpers/workforceStorageUtils";
import {
  IconPlus,
  IconBack,
  IconArrowRight,
  IconEmpty,
} from "../components/workforceIcons";
import {
  AMBER,
  statusBadgeStyle,
} from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  onBack: () => void;
  onNewAnnouncement: () => void;
  onOpenDashboard: (announcementId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab Definition                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

type TabKey = "open" | "confirmed" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

function getTabForStatus(status: AnnouncementStatus): TabKey {
  switch (status) {
    case "open":
    case "analyzing":
      return "open";
    case "confirmed":
      return "confirmed";
    case "completed":
    case "cancelled":
      return "completed";
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type ListSnapshot = {
  announcements: WorkforceAnnouncement[];
  categoryMap: Map<string, string>;
  counts: Record<TabKey, number>;
  ver: number;
};

let snapCache: ListSnapshot | null = null;
let snapVer = 0;

function getSnapshot(): ListSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;

  const announcements = workforceAnnouncementService.getAll();
  const cats = workforceCategoryService.getAll();
  const categoryMap = new Map<string, string>();
  for (const c of cats) categoryMap.set(c.id, c.name);

  const counts: Record<TabKey, number> = { open: 0, confirmed: 0, completed: 0 };
  for (const a of announcements) {
    counts[getTabForStatus(a.status)] += 1;
  }

  snapCache = { announcements, categoryMap, counts, ver: snapVer };
  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [WF_ANNOUNCEMENTS_CHANGED, WF_CATEGORIES_CHANGED];
  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Status Helpers                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function statusColor(status: AnnouncementStatus): string {
  switch (status) {
    case "open":
      return AMBER;
    case "analyzing":
      return "var(--wm-warning)";
    case "confirmed":
      return "var(--wm-success)";
    case "completed":
      return "var(--wm-er-muted)";
    case "cancelled":
      return "var(--wm-error)";
  }
}

function statusLabel(status: AnnouncementStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 0,
  borderBottom: "2px solid var(--wm-er-border)",
  marginTop: 14,
};

const tabBtnBase: React.CSSProperties = {
  flex: 1,
  padding: "10px 0",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  textAlign: "center",
  borderBottom: "2px solid transparent",
  marginBottom: -2,
  transition: "color 0.15s, border-color 0.15s",
};

const listCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-10, 10px)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
};

const countBadgeStyle = (isActive: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: 9,
  fontSize: 10,
  fontWeight: 800,
  marginLeft: 4,
  background: isActive ? AMBER : "var(--wm-er-border)",
  color: isActive ? "#fff" : "var(--wm-er-muted)",
});

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceAnnouncementsListPage({
  onBack,
  onNewAnnouncement,
  onOpenDashboard,
}: Props) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [activeTab, setActiveTab] = useState<TabKey>("open");

  const filtered = useMemo(
    () =>
      data.announcements
        .filter((a) => getTabForStatus(a.status) === activeTab)
        .sort((a, b) => b.createdAt - a.createdAt),
    [data.announcements, activeTab],
  );

  const handleTabClick = useCallback((key: TabKey) => {
    setActiveTab(key);
  }, []);

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={backBtnStyle}>
          <IconBack />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle">Announcements</div>
          <div className="wm-pageSub">
            All work announcements
          </div>
        </div>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onNewAnnouncement}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            background: AMBER,
            fontSize: 12,
            padding: "8px 14px",
          }}
        >
          <IconPlus /> New
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              style={{
                ...tabBtnBase,
                color: isActive ? AMBER : "var(--wm-er-muted)",
                borderBottomColor: isActive ? AMBER : "transparent",
              }}
            >
              {tab.label}
              <span style={countBadgeStyle(isActive)}>
                {data.counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {filtered.length === 0 ? (
          <div
            className="wm-er-card"
            style={{ padding: 32, textAlign: "center" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <IconEmpty />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--wm-er-text)",
                }}
              >
                No {activeTab} announcements
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--wm-er-muted)",
                  maxWidth: 260,
                  lineHeight: 1.5,
                }}
              >
                {activeTab === "open"
                  ? "Create a new announcement to assign work to your staff."
                  : activeTab === "confirmed"
                    ? "Confirmed announcements with active work groups will appear here."
                    : "Completed and cancelled announcements will appear here."}
              </div>
              {activeTab === "open" && (
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={onNewAnnouncement}
                  style={{
                    marginTop: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: AMBER,
                  }}
                >
                  <IconPlus /> New Announcement
                </button>
              )}
            </div>
          </div>
        ) : (
          filtered.map((ann) => {
            const totalVac =
              workforceAnnouncementService.getTotalVacancy(ann.id);
            return (
              <button
                key={ann.id}
                type="button"
                style={listCardStyle}
                onClick={() => onOpenDashboard(ann.id)}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--wm-er-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ann.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--wm-er-muted)",
                      marginTop: 3,
                    }}
                  >
                    {formatDate(ann.date)} · {ann.shifts.length} shift
                    {ann.shifts.length !== 1 ? "s" : ""} · {totalVac}{" "}
                    {totalVac === 1 ? "vacancy" : "vacancies"} ·{" "}
                    {ann.targetCategories.length}{" "}
                    {ann.targetCategories.length === 1
                      ? "category"
                      : "categories"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      ...statusBadgeStyle,
                      color: statusColor(ann.status),
                    }}
                  >
                    {statusLabel(ann.status)}
                  </span>
                  <span style={{ color: "var(--wm-er-muted)" }}>
                    <IconArrowRight />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}