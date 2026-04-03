// src/features/employer/workforceOps/components/GroupMembersTab.tsx
//
// Members tab for Group Detail page.
// Lists active/exited members with exit reason and management actions.

import { useMemo, useState, useCallback } from "react";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceGroup, WorkforceGroupMember } from "../types/workforceTypes";
import { IconStar } from "./workforceIcons";
import { AMBER, AMBER_BG } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  group: WorkforceGroup;
  members: WorkforceGroupMember[];
  onRefresh: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function GroupMembersTab({ group, members }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const activeMembers = useMemo(() => members.filter((m) => m.status === "active"), [members]);
  const exitedMembers = useMemo(() => members.filter((m) => m.status !== "active"), [members]);

  const [urgentMsg, setUrgentMsg] = useState("");
  const [urgentCatId, setUrgentCatId] = useState("");
  const [urgentResult, setUrgentResult] = useState("");

  const sendUrgent = useCallback(() => {
    if (!urgentCatId) return;
    const result = workforceGroupMemberService.sendUrgentBroadcast(group.id, urgentCatId, urgentMsg);
    if (result.success) {
      setUrgentResult(`Urgent broadcast sent to ${result.notifiedCount} staff.`);
      setUrgentMsg("");
      setTimeout(() => setUrgentResult(""), 3000);
    } else {
      setUrgentResult(result.errors?.[0] ?? "Failed.");
    }
  }, [group.id, urgentCatId, urgentMsg]);

  /* Unique categories in this group */
  const groupCatIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of members) ids.add(m.categoryId);
    return Array.from(ids);
  }, [members]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Active Members */}
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
        Active Members ({activeMembers.length})
      </div>

      {activeMembers.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {activeMembers.map((member) => {
            const shifts = member.assignedShiftIds
              .map((sid) => group.shifts.find((s) => s.id === sid)?.name ?? sid)
              .join(", ");

            return (
              <div
                key={member.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--wm-radius-10)",
                  border: "1px solid var(--wm-er-border)",
                  background: "var(--wm-er-card)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{member.employeeName}</div>
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                      {categoryMap.get(member.categoryId) ?? member.categoryId} · {shifts}
                    </div>
                  </div>
                  {member.postEventRating !== undefined && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, color: AMBER, fontWeight: 700 }}>
                      <IconStar /> {member.postEventRating}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 12 }}>
          No active members
        </div>
      )}

      {/* Exited Members */}
      {exitedMembers.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-muted)", marginTop: 4 }}>
            Exited / Replaced ({exitedMembers.length})
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {exitedMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--wm-radius-10)",
                  border: "1px solid var(--wm-er-border)",
                  background: "var(--wm-er-bg)",
                  opacity: 0.7,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>{member.employeeName}</div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {member.status === "replaced" ? "Replaced" : "Exited"}
                  {member.exitReason && ` · ${member.exitReason}`}
                  {member.exitNote && ` — ${member.exitNote}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Urgent Broadcast (IMP-3) */}
      {group.status === "active" && groupCatIds.length > 0 && (
        <div className="wm-er-card" style={{ marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-error)", marginBottom: 6 }}>
            Urgent Replacement Broadcast
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 8 }}>
            Send an urgent notification to all available staff in a category.
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {groupCatIds.map((catId) => (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setUrgentCatId(catId)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "none",
                    background: urgentCatId === catId ? AMBER : AMBER_BG,
                    color: urgentCatId === catId ? "#fff" : AMBER,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {categoryMap.get(catId) ?? catId}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="wm-input"
              placeholder="Optional message..."
              value={urgentMsg}
              onChange={(e) => setUrgentMsg(e.target.value)}
              style={{ fontSize: 12 }}
              maxLength={200}
            />

            <button
              className="wm-primarybtn"
              type="button"
              onClick={sendUrgent}
              disabled={!urgentCatId}
              style={{
                background: urgentCatId ? "var(--wm-error)" : "var(--wm-er-muted)",
                fontSize: 12,
                padding: "8px",
              }}
            >
              Send Urgent Broadcast
            </button>

            {urgentResult && (
              <div style={{ fontSize: 11, color: urgentResult.includes("sent") ? "var(--wm-success)" : "var(--wm-error)" }}>
                {urgentResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}