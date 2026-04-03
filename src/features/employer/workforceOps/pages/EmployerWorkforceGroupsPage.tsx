// src/features/employer/workforceOps/pages/EmployerWorkforceGroupsPage.tsx
//
// Workforce Ops Hub — Groups List.
// Active and completed groups with member counts and navigation.

import { useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { workforceGroupService } from "../services/workforceGroupService";
import type { WorkforceGroup } from "../types/workforceTypes";
import {
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
} from "../helpers/workforceStorageUtils";
import { IconBack, IconGroup, IconArrowRight, IconEmpty } from "../components/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  sectionTitleStyle,
  sectionIconWrapStyle,
  listRowBtnStyle,
  emptyStateStyle,
  statusBadgeStyle,
  timeAgo,
} from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  onBack: () => void;
  onOpenGroup: (groupId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type GroupsSnapshot = {
  groups: WorkforceGroup[];
  memberCounts: Map<string, number>;
  ver: number;
};

let snapCache: GroupsSnapshot | null = null;
let snapVer = 0;

function getSnapshot(): GroupsSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;
  const groups = workforceGroupService.getAll();
  const memberCounts = new Map<string, number>();
  for (const g of groups) {
    memberCounts.set(g.id, workforceGroupService.countMembersForGroup(g.id));
  }
  snapCache = { groups, memberCounts, ver: snapVer };
  return snapCache;
}

function subscribe(cb: () => void): () => void {
  const events = [WF_GROUPS_CHANGED, WF_MEMBERS_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceGroupsPage({ onBack, onOpenGroup }: Props) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [tab, setTab] = useState<"active" | "completed">("active");

  const filtered = useMemo(
    () => data.groups.filter((g) => g.status === tab),
    [data.groups, tab],
  );

  const activeCount = useMemo(() => data.groups.filter((g) => g.status === "active").length, [data.groups]);
  const completedCount = useMemo(() => data.groups.filter((g) => g.status === "completed").length, [data.groups]);

  const handleOpen = useCallback((groupId: string) => {
    onOpenGroup(groupId);
  }, [onOpenGroup]);

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">Work Groups</div>
          <div className="wm-pageSub">{data.groups.length} group{data.groups.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ marginTop: 14, display: "flex", gap: 0, borderRadius: "var(--wm-radius-10)", overflow: "hidden", border: "1px solid var(--wm-er-border)" }}>
        {([
          { key: "active" as const, label: "Active", count: activeCount },
          { key: "completed" as const, label: "Completed", count: completedCount },
        ]).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              background: tab === t.key ? AMBER : "var(--wm-er-card)",
              color: tab === t.key ? "#fff" : "var(--wm-er-text)",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ── Group List ── */}
      {filtered.length > 0 ? (
        <div style={{ marginTop: 14, display: "grid", gap: 10, marginBottom: 24 }}>
          {filtered.map((group) => {
            const members = data.memberCounts.get(group.id) ?? 0;
            return (
              <button
                key={group.id}
                type="button"
                style={listRowBtnStyle}
                onClick={() => handleOpen(group.id)}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {group.name}
                    </div>
                    {group.groupType === "quick" && (
                      <span style={{ padding: "1px 6px", borderRadius: 999, background: AMBER_BG, color: AMBER, fontSize: 9, fontWeight: 800 }}>QUICK</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {new Date(group.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · {members} member{members !== 1 ? "s" : ""} · {group.shifts.length} shift{group.shifts.length !== 1 ? "s" : ""}
                    {group.location && ` · ${group.location}`}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    Created {timeAgo(group.createdAt)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ ...statusBadgeStyle, color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)" }}>
                    {group.status === "active" ? "Active" : "Completed"}
                  </span>
                  <span style={{ color: "var(--wm-er-muted)" }}><IconArrowRight /></span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
              {tab === "active" ? "No active groups" : "No completed groups"}
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}>
              {tab === "active"
                ? "Groups are created automatically when you confirm an announcement, or you can create a quick group from the home page."
                : "Completed groups will appear here after they are marked as done."}
            </div>
          </div>
        </div>
      )}

      {/* ── How groups work ── */}
      {data.groups.length === 0 && (
        <div className="wm-er-card" style={{ marginBottom: 24 }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}><IconGroup /></div>
            How groups work
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
            {[
              "Create an announcement and confirm your selected staff",
              "A Work Group is created automatically with all confirmed members",
              "Communicate with your team, track attendance, and manage shifts",
              "After the work is done, rate your team and mark as completed",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 999,
                  background: AMBER_BG, color: AMBER,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: "var(--wm-er-text)", lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
