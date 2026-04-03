// src/features/employer/workforceOps/pages/EmployerWorkforceHomePage.tsx
//
// Workforce Ops Hub — Employer Home (Dashboard).
// KPIs, quick actions, categories, recent announcements, activity feed.

import { useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { workforceAnnouncementService } from "../services/workforceAnnouncementService";
import { workforceGroupService } from "../services/workforceGroupService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceStaffService } from "../services/workforceStaffService";
import type {
  WorkforceAnnouncement,
  WorkforceCategory,
  WorkforceActivityEntry,
} from "../types/workforceTypes";
import {
  WF_ANNOUNCEMENTS_KEY,
  WF_ANNOUNCEMENTS_CHANGED,
  WF_CATEGORIES_CHANGED,
  WF_STAFF_CHANGED,
  WF_GROUPS_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
} from "../helpers/workforceStorageUtils";
import { readAnnouncements, readActivity } from "../helpers/workforceNormalizers";
import {
  IconPlus,
  IconStaff,
  IconAnnounce,
  IconGroup,
  IconArrowRight,
  IconCategory,
  IconActivity,
  IconEmpty,
} from "../components/workforceIcons";
import { countWorkforcePendingRatings } from "../../helpers/ratingNudgeHelpers";
import {
  AMBER,
  actionBtnStyle,
  actionIconWrapStyle,
  sectionTitleStyle,
  sectionIconWrapStyle,
  listRowBtnStyle,
  categoryChipStyle,
  addChipBtnStyle,
  emptyStateStyle,
  stepCircleStyle,
  statusBadgeStyle,
  timeAgo,
} from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Workforce route helpers (Batch 5 will finalize in routePaths.ts)           */
/* ─────────────────────────────────────────────────────────────────────────── */

const WF_ROUTES = {
  staff: "/employer/workforce/staff",
  announcements: "/employer/workforce/announcements",
  announceCreate: "/employer/workforce/announce/create",
  announceDash: "/employer/workforce/announce/:announcementId",
  groups: "/employer/workforce/groups",
} as const;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription: reactive snapshot via useSyncExternalStore                   */
/* ─────────────────────────────────────────────────────────────────────────── */

type HomeSnapshot = {
  announcements: WorkforceAnnouncement[];
  categories: WorkforceCategory[];
  activeStaffCount: number;
  announcementCounts: Record<string, number>;
  groupCounts: Record<string, number>;
  recentActivity: WorkforceActivityEntry[];
  ver: number;
};

let snapCache: HomeSnapshot | null = null;
let snapVer = 0;

function getSnapshot(): HomeSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;

  const announcements = readAnnouncements(WF_ANNOUNCEMENTS_KEY);
  const categories = workforceCategoryService.getAll();
  const activeStaffCount = workforceStaffService.getAll().filter((s) => s.status === "active").length;
  const announcementCounts = workforceAnnouncementService.countByStatus();
  const groupCounts = workforceGroupService.countByStatus();
  const recentActivity = readActivity(WF_ACTIVITY_KEY).slice(0, 8);

  snapCache = { announcements, categories, activeStaffCount, announcementCounts, groupCounts, recentActivity, ver: snapVer };
  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [WF_ANNOUNCEMENTS_CHANGED, WF_CATEGORIES_CHANGED, WF_STAFF_CHANGED, WF_GROUPS_CHANGED, WF_ACTIVITY_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Announcement Status Display                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function statusColor(status: WorkforceAnnouncement["status"]): string {
  switch (status) {
    case "open": return AMBER;
    case "analyzing": return "var(--wm-warning)";
    case "confirmed": return "var(--wm-success)";
    case "completed": return "var(--wm-er-muted)";
    case "cancelled": return "var(--wm-error)";
  }
}

function statusLabel(status: WorkforceAnnouncement["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceHomePage() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  /* ── Category quick-add ── */
  const [showCatInput, setShowCatInput] = useState(false);
  const [catVal, setCatVal] = useState("");
  const [catErr, setCatErr] = useState("");

  const addCategory = useCallback(() => {
    const r = workforceCategoryService.create(catVal);
    if (r.success) { setCatVal(""); setShowCatInput(false); setCatErr(""); snapVer++; }
    else setCatErr(r.errors?.[0] ?? "Failed to add.");
  }, [catVal]);

  /* ── Category delete ── */
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; assignedCount: number } | null>(null);
  const [deleteErr, setDeleteErr] = useState("");

  const startDelete = useCallback((cat: WorkforceCategory) => {
    const staffList = workforceStaffService.getAll().filter((s) => s.status === "active");
    const assignedCount = staffList.filter((s) => s.categories.includes(cat.id)).length;
    setDeleteTarget({ id: cat.id, name: cat.name, assignedCount });
    setDeleteErr("");
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const staffList = workforceStaffService.getAll().filter((s) => s.status === "active");
    const r = workforceCategoryService.delete(deleteTarget.id, staffList, true);
    if (r.success) { setDeleteTarget(null); setDeleteErr(""); snapVer++; }
    else setDeleteErr(r.errors?.[0] ?? "Failed to delete.");
  }, [deleteTarget]);

  const recentAnnouncements = useMemo(() => data.announcements.slice(0, 5), [data.announcements]);
  const hasData = data.activeStaffCount > 0 || data.announcements.length > 0;

  const nav = useNavigate();
  const navTo = useCallback((path: string) => { nav(path); }, [nav]);

  /* Seed defaults on first visit */
  useMemo(() => { workforceCategoryService.seedDefaults(); }, []);

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Workforce Ops Hub</div>
          <div className="wm-pageSub">Manage your permanent staff and work assignments</div>
        </div>
        <button
          className="wm-primarybtn" type="button"
          onClick={() => navTo(WF_ROUTES.announceCreate)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: AMBER }}
        >
          <IconPlus /> New Announcement
        </button>
      </div>

      {/* ── KPI Row 1 ── */}
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Staff</div>
          <div className="wm-er-tileValue" style={{ color: data.activeStaffCount > 0 ? AMBER : undefined }}>{data.activeStaffCount}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Categories</div>
          <div className="wm-er-tileValue">{data.categories.length}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Active Groups</div>
          <div className="wm-er-tileValue" style={{ color: data.groupCounts.active > 0 ? "var(--wm-success)" : undefined }}>{data.groupCounts.active}</div>
        </div>
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="wm-er-tiles" style={{ marginTop: 8 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Open</div>
          <div className="wm-er-tileValue" style={{ color: data.announcementCounts.open > 0 ? AMBER : undefined }}>{data.announcementCounts.open}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Confirmed</div>
          <div className="wm-er-tileValue" style={{ color: data.announcementCounts.confirmed > 0 ? "var(--wm-success)" : undefined }}>{data.announcementCounts.confirmed}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Completed</div>
          <div className="wm-er-tileValue">{data.announcementCounts.completed}</div>
        </div>
      </div>

      {/* ── Rating Nudge — Pending Ratings Card ── */}
      {(() => {
        const pendingCount = countWorkforcePendingRatings();
        if (pendingCount === 0) return null;
        return (
          <div
            style={{
              marginTop: 12,
              padding: "12px 16px",
              borderRadius: "var(--wm-radius-14)",
              background: "rgba(217, 119, 6, 0.06)",
              border: "1px solid rgba(217, 119, 6, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#92400e" }}>
                {pendingCount} member{pendingCount !== 1 ? "s" : ""} pending rating
              </div>
              <div style={{ fontSize: 11, color: "#92400e", marginTop: 2, opacity: 0.8 }}>
                Rate your team to help workers build their reputation.
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(217, 119, 6, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 16,
              }}
            >
              ⚠
            </div>
          </div>
        );
      })()}

      {/* ── Quick Actions ── */}
      <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
        <button type="button" style={actionBtnStyle} onClick={() => navTo(WF_ROUTES.staff)}>
          <div style={actionIconWrapStyle}><IconStaff /></div>
          <span>My Staff</span>
          {data.activeStaffCount > 0 && <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{data.activeStaffCount} active</span>}
        </button>
        <button type="button" style={actionBtnStyle} onClick={() => navTo(WF_ROUTES.announcements)}>
          <div style={actionIconWrapStyle}><IconAnnounce /></div>
          <span>Announcements</span>
          {data.announcementCounts.open > 0 && <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{data.announcementCounts.open} open</span>}
        </button>
        <button type="button" style={actionBtnStyle} onClick={() => navTo(WF_ROUTES.groups)}>
          <div style={actionIconWrapStyle}><IconGroup /></div>
          <span>Groups</span>
          {data.groupCounts.active > 0 && <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{data.groupCounts.active} active</span>}
        </button>
      </div>

      {/* ── Categories ── */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconWrapStyle}><IconCategory /></div>
          Staff Categories
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.categories.map((c) => (
            <span key={c.id} style={{ ...categoryChipStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
              {c.name}
              <button
                type="button"
                onClick={() => startDelete(c)}
                style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 0, fontSize: 13, fontWeight: 900, lineHeight: 1, marginLeft: 2, opacity: 0.6 }}
                title={`Delete ${c.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {!showCatInput && (
            <button type="button" style={addChipBtnStyle} onClick={() => setShowCatInput(true)}>
              <IconPlus /> Add
            </button>
          )}
        </div>
        {showCatInput && (
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text" className="wm-input" placeholder="Category name"
              value={catVal} onChange={(e) => { setCatVal(e.target.value); setCatErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setShowCatInput(false); setCatVal(""); setCatErr(""); } }}
              style={{ flex: 1, fontSize: 13 }} autoFocus maxLength={40}
            />
            <button className="wm-primarybtn" type="button" onClick={addCategory} disabled={!catVal.trim()} style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}>Add</button>
            <button type="button" onClick={() => { setShowCatInput(false); setCatVal(""); setCatErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 700 }}>Cancel</button>
          </div>
        )}
        {catErr && <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-error)" }}>{catErr}</div>}

        {/* Delete Confirmation */}
        {deleteTarget && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, border: "1px solid var(--wm-error)", background: "rgba(220,38,38,0.04)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-error)" }}>Delete "{deleteTarget.name}"?</div>
            {deleteTarget.assignedCount > 0 && (
              <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4, lineHeight: 1.5 }}>
                ⚠ {deleteTarget.assignedCount} staff member{deleteTarget.assignedCount !== 1 ? "s are" : " is"} assigned to this category. They will lose this category assignment.
              </div>
            )}
            {deleteTarget.assignedCount === 0 && (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>No staff members are assigned to this category.</div>
            )}
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button className="wm-primarybtn" type="button" onClick={confirmDelete} style={{ background: "var(--wm-error)", fontSize: 12, padding: "6px 14px" }}>Yes, Delete</button>
              <button type="button" onClick={() => { setDeleteTarget(null); setDeleteErr(""); }} style={{ background: "none", border: "1px solid var(--wm-er-border)", borderRadius: "var(--wm-radius-10)", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Cancel</button>
            </div>
            {deleteErr && <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{deleteErr}</div>}
          </div>
        )}
      </div>

      {/* ── How It Works ── */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>How it works</div>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            "Add your staff and organise them into categories",
            "Create an announcement — pick categories, set shifts and vacancies",
            "Your staff see the announcement and mark availability",
            "Review applications, confirm selections — a Work Group is created automatically",
            "Track attendance, communicate with your team, and rate after completion",
          ].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={stepCircleStyle}>{i + 1}</div>
              <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Announcements ── */}
      {recentAnnouncements.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <div style={sectionTitleStyle}>Recent Announcements</div>
          <div style={{ display: "grid", gap: 8 }}>
            {recentAnnouncements.map((a) => {
              const totalVac = workforceAnnouncementService.getTotalVacancy(a.id);
              return (
                <button key={a.id} type="button" style={listRowBtnStyle} onClick={() => navTo(WF_ROUTES.announceDash.replace(":announcementId", a.id))}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                      {new Date(a.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · {a.shifts.length} shift{a.shifts.length !== 1 ? "s" : ""} · {totalVac} {totalVac === 1 ? "vacancy" : "vacancies"} · {a.targetCategories.length} {a.targetCategories.length === 1 ? "category" : "categories"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ ...statusBadgeStyle, color: statusColor(a.status) }}>{statusLabel(a.status)}</span>
                    <span style={{ color: "var(--wm-er-muted)" }}><IconArrowRight /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : !hasData ? (
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>No announcements yet</div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}>Start by adding your staff, then create your first announcement to assign work.</div>
            <button className="wm-primarybtn" type="button" onClick={() => navTo(WF_ROUTES.staff)} style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6, background: AMBER }}>
              <IconPlus /> Add Staff
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Recent Activity ── */}
      {data.recentActivity.length > 0 && (
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}><IconActivity /></div>
            Recent Activity
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {data.recentActivity.map((entry) => (
              <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--wm-er-border)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</div>
                  {entry.body && <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{entry.body}</div>}
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(entry.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentActivity.length === 0 && <div style={{ height: 24 }} />}
    </div>
  );
}