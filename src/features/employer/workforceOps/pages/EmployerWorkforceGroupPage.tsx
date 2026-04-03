// src/features/employer/workforceOps/pages/EmployerWorkforceGroupPage.tsx
//
// Workforce Ops Hub — Group Detail Page.
// Tabs: Chat, Members, Attendance. Complete group + post-event rating trigger.

import { useMemo, useSyncExternalStore, useState, useCallback, useRef, useEffect } from "react";
import { workforceGroupService } from "../services/workforceGroupService";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";
import type { WorkforceGroup, WorkforceGroupMember, WorkforceMessage } from "../types/workforceTypes";
import {
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
  WF_MESSAGES_KEY,
  WF_MESSAGES_CHANGED,
  WF_ATTENDANCE_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../helpers/workforceStorageUtils";
import { readMembers, readMessages } from "../helpers/workforceNormalizers";
import { validateMessage } from "../helpers/workforceValidation";
import { WorkforceGroupMessageBubble } from "../components/WorkforceGroupMessageBubble";
import { GroupMembersTab } from "../components/GroupMembersTab";
import { GroupAttendanceTab } from "../components/GroupAttendanceTab";
import { IconBack } from "../components/workforceIcons";
import { AMBER, statusBadgeStyle } from "../components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  groupId: string;
  onBack: () => void;
  onOpenRating?: (groupId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Subscription                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type GroupSnapshot = {
  group: WorkforceGroup | null;
  members: WorkforceGroupMember[];
  messages: WorkforceMessage[];
  ver: number;
};

let snapCache: GroupSnapshot | null = null;
let snapVer = 0;
let cachedGId = "";

function getSnapshot(gId: string): () => GroupSnapshot {
  return () => {
    if (snapCache && snapCache.ver === snapVer && cachedGId === gId) return snapCache;
    cachedGId = gId;
    const group = workforceGroupService.getById(gId);
    const members = readMembers(WF_MEMBERS_CHANGED).length > -1
      ? workforceGroupMemberService.getMembersForGroup(gId)
      : [];
    const messages = readMessages(WF_MESSAGES_KEY).filter((m) => m.groupId === gId);
    snapCache = { group, members, messages, ver: snapVer };
    return snapCache;
  };
}

function subscribe(cb: () => void): () => void {
  const events = [WF_GROUPS_CHANGED, WF_MEMBERS_CHANGED, WF_MESSAGES_CHANGED, WF_ATTENDANCE_CHANGED];
  const handler = () => { snapVer++; snapCache = null; cb(); };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tab Type                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

type Tab = "chat" | "members" | "attendance";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployerWorkforceGroupPage({ groupId, onBack, onOpenRating }: Props) {
  const snapshotFn = useMemo(() => getSnapshot(groupId), [groupId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const [tab, setTab] = useState<Tab>("chat");
  const [msgText, setMsgText] = useState("");
  const [msgError, setMsgError] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll chat */
  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages.length, tab]);

  /* ── Send Message ── */
  const sendMessage = useCallback(() => {
    const validation = validateMessage(msgText);
    if (!validation.valid) {
      setMsgError(validation.errors[0]);
      return;
    }

    const allMessages = readMessages(WF_MESSAGES_KEY);
    const newMsg: WorkforceMessage = {
      id: uid("wm"),
      groupId,
      senderType: "employer",
      senderName: "Employer",
      senderId: "employer",
      text: msgText.trim(),
      createdAt: Date.now(),
      isUrgent: false,
    };

    safeWrite(WF_MESSAGES_KEY, [...allMessages, newMsg]);
    safeDispatch(WF_MESSAGES_CHANGED);
    setMsgText("");
    setMsgError("");
    snapVer++;
  }, [groupId, msgText]);

  /* ── Complete Group ── */
  const handleComplete = useCallback(() => {
    const result = workforceGroupService.completeGroup(groupId);
    if (result.success) {
      setConfirmComplete(false);
      snapVer++;
      onOpenRating?.(groupId);
    }
  }, [groupId, onOpenRating]);

  /* ── Refresh for members tab ── */
  const refreshData = useCallback(() => { snapVer++; }, []);

  /* ── Guard ── */
  if (!data.group) {
    return (
      <div className="wm-er-vWorkforce">
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4 }}><IconBack /></button>
          <div className="wm-pageTitle">Group not found</div>
        </div>
      </div>
    );
  }

  const group = data.group;
  const activeMembers = data.members.filter((m) => m.status === "active").length;

  return (
    <div className="wm-er-vWorkforce">
      {/* ── Header ── */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wm-pageTitle" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</div>
          <div className="wm-pageSub">{activeMembers} member{activeMembers !== 1 ? "s" : ""} · {new Date(group.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <span style={{ ...statusBadgeStyle, color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)", fontSize: 12 }}>
          {group.status === "active" ? "Active" : "Completed"}
        </span>
      </div>

      {/* ── Tabs ── */}
      <div style={{ marginTop: 12, display: "flex", gap: 0, borderRadius: "var(--wm-radius-10)", overflow: "hidden", border: "1px solid var(--wm-er-border)" }}>
        {([
          { key: "chat" as Tab, label: "Chat", count: data.messages.length },
          { key: "members" as Tab, label: "Members", count: activeMembers },
          { key: "attendance" as Tab, label: "Attendance" },
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
            {t.label}{"count" in t && t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ marginTop: 12 }}>
        {/* Chat Tab */}
        {tab === "chat" && (
          <div>
            {/* Messages */}
            <div
              style={{
                minHeight: 200,
                maxHeight: 400,
                overflowY: "auto",
                padding: "8px 0",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {data.messages.length === 0 && (
                <div style={{ textAlign: "center", padding: 32, fontSize: 13, color: "var(--wm-er-muted)" }}>
                  No messages yet. Start the conversation with your team.
                </div>
              )}
              {data.messages.map((msg) => (
                <WorkforceGroupMessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderType === "employer"}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Send Message */}
            {group.status === "active" && (
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  className="wm-input"
                  placeholder="Type a message..."
                  value={msgText}
                  onChange={(e) => { setMsgText(e.target.value); setMsgError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  style={{ flex: 1, fontSize: 13 }}
                  maxLength={500}
                />
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={sendMessage}
                  disabled={!msgText.trim()}
                  style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}
                >
                  Send
                </button>
              </div>
            )}
            {msgError && <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{msgError}</div>}
          </div>
        )}

        {/* Members Tab */}
        {tab === "members" && (
          <GroupMembersTab group={group} members={data.members} onRefresh={refreshData} />
        )}

        {/* Attendance Tab */}
        {tab === "attendance" && (
          <GroupAttendanceTab group={group} members={data.members} />
        )}
      </div>

      {/* ── Complete Group Action ── */}
      {group.status === "active" && (
        <div style={{ marginTop: 16, marginBottom: 24 }}>
          {!confirmComplete ? (
            <button
              type="button"
              onClick={() => setConfirmComplete(true)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--wm-radius-10)",
                border: "1px solid var(--wm-er-muted)",
                background: "var(--wm-er-bg)",
                color: "var(--wm-er-text)",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Mark Group as Completed
            </button>
          ) : (
            <div className="wm-er-card" style={{ border: "1px solid var(--wm-success)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-success)" }}>Complete this group?</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4, lineHeight: 1.5 }}>
                This will end the group. You'll be prompted to rate each member.
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button className="wm-primarybtn" type="button" onClick={handleComplete} style={{ background: "var(--wm-success)", padding: "8px 16px" }}>Yes, Complete</button>
                <button type="button" onClick={() => setConfirmComplete(false)} style={{ background: "none", border: "1px solid var(--wm-er-border)", borderRadius: "var(--wm-radius-10)", padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Rate Your Team Banner (completed groups with unrated members) ── */}
      {group.status === "completed" && (() => {
        const unrated = data.members.filter(
          (m) => m.status === "active" && !(typeof m.postEventRating === "number" && m.postEventRating > 0),
        );
        if (unrated.length === 0) return null;
        return (
          <div
            style={{
              marginTop: 16,
              padding: "14px 16px",
              borderRadius: "var(--wm-radius-14)",
              background: "rgba(217, 119, 6, 0.06)",
              border: "1px solid rgba(217, 119, 6, 0.18)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#92400e" }}>
              Rate your team
            </div>
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 4, lineHeight: 1.5, opacity: 0.85 }}>
              {unrated.length} member{unrated.length !== 1 ? "s" : ""} not rated yet. Your rating helps workers get better opportunities and builds a stronger workforce.
            </div>
            {onOpenRating && (
              <button
                type="button"
                onClick={() => onOpenRating(groupId)}
                style={{
                  marginTop: 10,
                  height: 38,
                  padding: "0 18px",
                  borderRadius: "var(--wm-radius-10)",
                  border: "none",
                  background: AMBER,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ★ Rate {unrated.length} Member{unrated.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        );
      })()}

      {group.status === "active" || <div style={{ height: 24 }} />}
    </div>
  );
}