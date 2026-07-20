// App: Job Mitra / WorkMitra_Enterprise_v2
// File: GroupMembersTab.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\GroupMembersTab.tsx

import { useCallback, useMemo, useState } from "react";
import type {
  WorkforceGroup,
  WorkforceGroupMember,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconStar } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";
import { workforceCategoryService } from "../services/workforceCategoryService";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";

type Props = {
  group: WorkforceGroup;
  members: WorkforceGroupMember[];
  onRefresh: () => void;
};

export function GroupMembersTab({ group, members }: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categories) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categories]);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === "active"),
    [members],
  );

  const exitedMembers = useMemo(
    () => members.filter((member) => member.status !== "active"),
    [members],
  );

  const [urgentMsg, setUrgentMsg] = useState("");
  const [urgentCatId, setUrgentCatId] = useState("");
  const [urgentResult, setUrgentResult] = useState("");

  const groupCatIds = useMemo(() => {
    const ids = new Set<string>();

    for (const member of members) {
      ids.add(member.categoryId);
    }

    return Array.from(ids);
  }, [members]);

  const sendUrgent = useCallback(() => {
    if (!urgentCatId) return;

    const result = workforceGroupMemberService.sendUrgentBroadcast(
      group.id,
      urgentCatId,
      urgentMsg,
    );

    if (result.success) {
      setUrgentResult(`Urgent broadcast sent to ${result.notifiedCount} staff.`);
      setUrgentMsg("");
      setTimeout(() => setUrgentResult(""), 3000);
      return;
    }

    setUrgentResult(result.errors?.[0] ?? "Failed.");
  }, [group.id, urgentCatId, urgentMsg]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
        Active Members ({activeMembers.length})
      </div>

      {activeMembers.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {activeMembers.map((member) => {
            const shifts = member.assignedShiftIds
              .map((shiftId) => group.shifts.find((shift) => shift.id === shiftId)?.name ?? shiftId)
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
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                      {member.employeeName}
                    </div>

                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                      {categoryMap.get(member.categoryId) ?? member.categoryId} - {shifts}
                    </div>
                  </div>

                  {member.postEventRating !== undefined && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        fontSize: 12,
                        color: AMBER,
                        fontWeight: 700,
                      }}
                    >
                      <IconStar /> {member.postEventRating}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 12 }}
        >
          No active members
        </div>
      )}

      {exitedMembers.length > 0 && (
        <>
          <div
            className="wm-er-card"
            style={{
              border: "1px solid rgba(220,38,38,0.22)",
              background: "rgba(254,242,242,0.78)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-error)" }}>
              Worker exit alert
            </div>

            <div
              style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-text)", lineHeight: 1.5 }}
            >
              One or more workers left this group. Review the reason and arrange a replacement if
              needed.
            </div>
          </div>

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
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>
                  {member.employeeName}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {member.status === "replaced" ? "Replaced" : "Exited"}
                  {member.exitReason && ` - ${member.exitReason}`}
                  {member.exitNote && ` - ${member.exitNote}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
              onChange={(event) => setUrgentMsg(event.target.value)}
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
              <div
                style={{
                  fontSize: 11,
                  color: urgentResult.includes("sent") ? "var(--wm-success)" : "var(--wm-error)",
                }}
              >
                {urgentResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
