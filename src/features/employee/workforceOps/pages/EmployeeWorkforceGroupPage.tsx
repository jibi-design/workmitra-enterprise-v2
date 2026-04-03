// src/features/employee/workforceOps/pages/EmployeeWorkforceGroupPage.tsx
//
// Workforce Ops Hub — Employee Group View.
// Chat, shift roster, sign in/out (IMP-7), exit with reason.

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import type {
  WorkforceMessage,
  AttendanceRecord,
  CancelReason,
} from "../../../employer/workforceOps/types/workforceTypes";
import {
  WF_MESSAGES_KEY,
  WF_MESSAGES_CHANGED,
  WF_ATTENDANCE_KEY,
  WF_ATTENDANCE_CHANGED,
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../employer/workforceOps/helpers/workforceStorageUtils";
import { readMessages, readAttendance, readGroups, readMembers } from "../../../employer/workforceOps/helpers/workforceNormalizers";
import { workforceGroupMemberService } from "../../../employer/workforceOps/services/workforceGroupMemberService";
import { validateMessage } from "../../../employer/workforceOps/helpers/workforceValidation";
import { WorkforceGroupMessageBubble } from "../../../employer/workforceOps/components/WorkforceGroupMessageBubble";
import { IconBack } from "../../../employer/workforceOps/components/workforceIcons";
import { AMBER, AMBER_BG, statusBadgeStyle } from "../../../employer/workforceOps/components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  groupId: string;
  onBack: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab Type                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

type Tab = "chat" | "shifts" | "exit";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployeeWorkforceGroupPage({ groupId, onBack }: Props) {
  const myId = useMemo(() => employeeWorkforceHelpers.getMyUniqueId(), []);

  const group = useMemo(
    () => readGroups(WF_GROUPS_KEY).find((g) => g.id === groupId) ?? null,
    [groupId],
  );

  const myMember = useMemo(() => {
    if (!myId) return null;
    return readMembers(WF_MEMBERS_KEY).find(
      (m) => m.groupId === groupId && m.employeeUniqueId === myId && m.status === "active",
    ) ?? null;
  }, [groupId, myId]);

  const messages = useMemo(
    () => readMessages(WF_MESSAGES_KEY).filter((m) => m.groupId === groupId),
    [groupId],
  );

  const attendance = useMemo(
    () => readAttendance(WF_ATTENDANCE_KEY).filter((a) => a.groupId === groupId),
    [groupId],
  );

  const [tab, setTab] = useState<Tab>("chat");
  const [msgText, setMsgText] = useState("");
  const [msgError, setMsgError] = useState("");
  const [exitReason, setExitReason] = useState<CancelReason>("other");
  const [exitNote, setExitNote] = useState("");
  const [exitConfirm, setExitConfirm] = useState(false);
  const [exitDone, setExitDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, tab]);

  /* ── Send Message ── */
  const sendMessage = useCallback(() => {
    const validation = validateMessage(msgText);
    if (!validation.valid) { setMsgError(validation.errors[0]); return; }

    const allMessages = readMessages(WF_MESSAGES_KEY);
    const newMsg: WorkforceMessage = {
      id: uid("wm"),
      groupId,
      senderType: "employee",
      senderName: myMember?.employeeName ?? "Employee",
      senderId: myId,
      text: msgText.trim(),
      createdAt: Date.now(),
      isUrgent: false,
    };

    safeWrite(WF_MESSAGES_KEY, [...allMessages, newMsg]);
    safeDispatch(WF_MESSAGES_CHANGED);
    setMsgText("");
    setMsgError("");
  }, [groupId, msgText, myMember, myId]);

  /* ── Sign In / Out ── */
  const getMyAttendance = useCallback((shiftId: string): AttendanceRecord | undefined => {
    if (!myMember) return undefined;
    return attendance.find(
      (a) => a.memberId === myMember.id && a.shiftId === shiftId,
    );
  }, [attendance, myMember]);

  const signIn = useCallback((shiftId: string) => {
    if (!myMember) return;
    const existing = getMyAttendance(shiftId);
    if (existing) return;

    const allAttendance = readAttendance(WF_ATTENDANCE_KEY);
    const record: AttendanceRecord = {
      id: uid("wa"),
      groupId,
      memberId: myMember.id,
      employeeUniqueId: myId,
      shiftId,
      signInAt: Date.now(),
      signOutAt: null,
      signOutType: null,
      hoursWorked: null,
    };

    safeWrite(WF_ATTENDANCE_KEY, [...allAttendance, record]);
    safeDispatch(WF_ATTENDANCE_CHANGED);
  }, [groupId, myMember, myId, getMyAttendance]);

  const signOut = useCallback((shiftId: string) => {
    if (!myMember) return;
    const allAttendance = readAttendance(WF_ATTENDANCE_KEY);
    const now = Date.now();

    const updated = allAttendance.map((a) => {
      if (a.memberId === myMember.id && a.shiftId === shiftId && !a.signOutAt) {
        const hours = Math.round(((now - a.signInAt) / 3600000) * 100) / 100;
        return { ...a, signOutAt: now, signOutType: "manual" as const, hoursWorked: hours };
      }
      return a;
    });

    safeWrite(WF_ATTENDANCE_KEY, updated);
    safeDispatch(WF_ATTENDANCE_CHANGED);
  }, [myMember]);

  /* ── Exit Group ── */
  const handleExit = useCallback(() => {
    if (!myMember) return;
    workforceGroupMemberService.exitMember(myMember.id, exitReason, exitNote);
    setExitDone(true);
  }, [myMember, exitReason, exitNote]);

  /* Guard */
  if (!group) {
    return (
      <div style={{ padding: "0 16px" }}>
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4 }}><IconBack /></button>
          <div className="wm-pageTitle">Group not found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Header */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</div>
          <div className="wm-pageSub">{new Date(group.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}{group.location ? ` · ${group.location}` : ""}</div>
        </div>
        <span style={{ ...statusBadgeStyle, color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)", fontSize: 12 }}>
          {group.status === "active" ? "Active" : "Completed"}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 12, display: "flex", gap: 0, borderRadius: "var(--wm-radius-10)", overflow: "hidden", border: "1px solid var(--wm-er-border)" }}>
        {([
          { key: "chat" as Tab, label: "Chat" },
          { key: "shifts" as Tab, label: "My Shifts" },
          { key: "exit" as Tab, label: "Exit" },
        ]).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "9px 6px",
              border: "none",
              background: tab === t.key ? AMBER : "var(--wm-er-card)",
              color: tab === t.key ? "#fff" : "var(--wm-er-text)",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === "chat" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ minHeight: 200, maxHeight: 400, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column", gap: 4 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: 32, fontSize: 13, color: "var(--wm-er-muted)" }}>
                No messages yet. Say hello to your team.
              </div>
            )}
            {messages.map((msg) => (
              <WorkforceGroupMessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === myId}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {group.status === "active" && myMember && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <input
                type="text" className="wm-input"
                placeholder="Type a message..."
                value={msgText}
                onChange={(e) => { setMsgText(e.target.value); setMsgError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                style={{ flex: 1, fontSize: 13 }}
                maxLength={500}
              />
              <button className="wm-primarybtn" type="button" onClick={sendMessage} disabled={!msgText.trim()} style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}>Send</button>
            </div>
          )}
          {msgError && <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{msgError}</div>}
        </div>
      )}

      {/* Shifts Tab (Sign In / Sign Out) */}
      {tab === "shifts" && myMember && (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>My Assigned Shifts</div>

          {myMember.assignedShiftIds.map((shiftId) => {
            const shift = group.shifts.find((s) => s.id === shiftId);
            if (!shift) return null;

            const record = getMyAttendance(shiftId);
            const isSignedIn = record && !record.signOutAt;
            const isComplete = record?.signOutAt !== undefined && record?.signOutAt !== null;

            return (
              <div
                key={shiftId}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--wm-radius-10)",
                  border: isSignedIn ? `2px solid var(--wm-success)` : "1px solid var(--wm-er-border)",
                  background: isSignedIn ? "rgba(22,163,74,0.04)" : "var(--wm-er-card)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
                      {shift.name}
                      {shift.hasBreak && (
                        <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: AMBER, padding: "1px 6px", borderRadius: 999, background: AMBER_BG }}>
                          BREAK
                        </span>
                      )}
                    </div>
                    {shift.hasBreak ? (
                      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
                        Duty 1: {shift.startTime} – {shift.breakStartTime} · Break: {shift.breakStartTime} – {shift.breakEndTime} · Duty 2: {shift.breakEndTime} – {shift.endTime}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{shift.startTime} — {shift.endTime}</div>
                    )}
                  </div>

                  {!record && group.status === "active" && (
                    <button className="wm-primarybtn" type="button" onClick={() => signIn(shiftId)} style={{ background: "var(--wm-success)", fontSize: 12, padding: "6px 14px" }}>
                      Sign In
                    </button>
                  )}

                  {isSignedIn && (
                    <button className="wm-primarybtn" type="button" onClick={() => signOut(shiftId)} style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}>
                      Sign Out
                    </button>
                  )}

                  {isComplete && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-success)" }}>✓ Done</span>
                  )}
                </div>

                {record && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
                    In: {new Date(record.signInAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    {record.signOutAt && ` · Out: ${new Date(record.signOutAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                    {record.hoursWorked !== null && ` · ${record.hoursWorked.toFixed(1)}h`}
                  </div>
                )}
              </div>
            );
          })}

          {myMember.assignedShiftIds.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 16 }}>
              No shifts assigned to you
            </div>
          )}
        </div>
      )}

      {/* Exit Tab */}
      {tab === "exit" && myMember && !exitDone && (
        <div style={{ marginTop: 12 }}>
          <div className="wm-er-card">
            <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-error)" }}>Can't Attend?</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
              If you can no longer attend, let the employer know. A replacement may be found automatically.
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>Reason</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["sick", "emergency", "travel", "other"] as CancelReason[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setExitReason(r)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: exitReason === r ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                        background: exitReason === r ? AMBER_BG : "var(--wm-er-bg)",
                        color: exitReason === r ? AMBER : "var(--wm-er-text)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>Note (optional)</div>
                <input
                  type="text" className="wm-input"
                  placeholder="Any additional details..."
                  value={exitNote}
                  onChange={(e) => setExitNote(e.target.value)}
                  style={{ width: "100%", fontSize: 13 }}
                  maxLength={200}
                />
              </div>

              {!exitConfirm ? (
                <button
                  type="button"
                  onClick={() => setExitConfirm(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--wm-radius-10)",
                    border: "1px solid var(--wm-error)",
                    background: "rgba(220,38,38,0.06)",
                    color: "var(--wm-error)",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  I Can't Attend
                </button>
              ) : (
                <div style={{ padding: 12, borderRadius: 10, border: "1px solid var(--wm-error)", background: "rgba(220,38,38,0.04)" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-error)" }}>Are you sure?</div>
                  <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4 }}>
                    You will be removed from this group. This cannot be undone.
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button className="wm-primarybtn" type="button" onClick={handleExit} style={{ background: "var(--wm-error)", padding: "8px 16px" }}>Yes, Exit</button>
                    <button type="button" onClick={() => setExitConfirm(false)} style={{ background: "none", border: "1px solid var(--wm-er-border)", borderRadius: "var(--wm-radius-10)", padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exit Done */}
      {tab === "exit" && exitDone && (
        <div className="wm-er-card" style={{ marginTop: 12, textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>You've exited this group</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>The employer has been notified.</div>
          <button className="wm-primarybtn" type="button" onClick={onBack} style={{ marginTop: 12, background: AMBER }}>Go Back</button>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}