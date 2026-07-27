// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\pages\EmployeeWorkforceGroupPage.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AttendanceRecord,
  CancelReason,
  WorkforceMessage,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  readAttendance,
  readGroups,
  readMembers,
  readMessages,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  safeDispatch,
  safeWrite,
  uid,
  WF_ATTENDANCE_CHANGED,
  WF_ATTENDANCE_KEY,
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
  WF_MESSAGES_CHANGED,
  WF_MESSAGES_KEY,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { validateMessage } from "../../../../shared/domains/workforce/validation/workforceValidation";
import { EmployeeWorkforceGroupChatPanel } from "../components/EmployeeWorkforceGroupChatPanel";
import { EmployeeWorkforceGroupExitPanel } from "../components/EmployeeWorkforceGroupExitPanel";
import { EmployeeWorkforceGroupHeader } from "../components/EmployeeWorkforceGroupHeader";
import { EmployeeWorkforceGroupNotFound } from "../components/EmployeeWorkforceGroupNotFound";
import { EmployeeWorkforceGroupShiftsPanel } from "../components/EmployeeWorkforceGroupShiftsPanel";
import { EmployeeWorkforceGroupTabs } from "../components/EmployeeWorkforceGroupTabs";
import type { EmployeeWorkforceGroupTab } from "../components/EmployeeWorkforceGroupTabs";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import { workforceGroupMemberService } from "../../../shared/workforce/workforcePublic";

type Props = {
  groupId: string;
  onBack: () => void;
};

export function EmployeeWorkforceGroupPage({ groupId, onBack }: Props) {
  const myId = useMemo(() => employeeWorkforceHelpers.getMyUniqueId(), []);

  const group = useMemo(
    () => readGroups(WF_GROUPS_KEY).find((item) => item.id === groupId) ?? null,
    [groupId],
  );

  const myMember = useMemo(() => {
    if (!myId) return null;

    return (
      readMembers(WF_MEMBERS_KEY).find(
        (member) =>
          member.groupId === groupId &&
          member.employeeUniqueId === myId &&
          member.status === "active",
      ) ?? null
    );
  }, [groupId, myId]);

  const messages = useMemo(
    () => readMessages(WF_MESSAGES_KEY).filter((message) => message.groupId === groupId),
    [groupId],
  );

  const attendance = useMemo(
    () => readAttendance(WF_ATTENDANCE_KEY).filter((record) => record.groupId === groupId),
    [groupId],
  );

  const [tab, setTab] = useState<EmployeeWorkforceGroupTab>("chat");
  const [msgText, setMsgText] = useState("");
  const [msgError, setMsgError] = useState("");
  const [exitReason, setExitReason] = useState<CancelReason>("other");
  const [exitNote, setExitNote] = useState("");
  const [exitConfirm, setExitConfirm] = useState(false);
  const [exitDone, setExitDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, tab]);

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
  }, [groupId, msgText, myId, myMember]);

  const getMyAttendance = useCallback(
    (shiftId: string): AttendanceRecord | undefined => {
      if (!myMember) return undefined;

      return attendance.find(
        (record) => record.memberId === myMember.id && record.shiftId === shiftId,
      );
    },
    [attendance, myMember],
  );

  const signIn = useCallback(
    (shiftId: string) => {
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
    },
    [getMyAttendance, groupId, myId, myMember],
  );

  const signOut = useCallback(
    (shiftId: string) => {
      if (!myMember) return;

      const allAttendance = readAttendance(WF_ATTENDANCE_KEY);
      const now = Date.now();

      const updated = allAttendance.map((record) => {
        if (record.memberId === myMember.id && record.shiftId === shiftId && !record.signOutAt) {
          const hours = Math.round(((now - record.signInAt) / 3600000) * 100) / 100;

          return {
            ...record,
            signOutAt: now,
            signOutType: "manual" as const,
            hoursWorked: hours,
          };
        }

        return record;
      });

      safeWrite(WF_ATTENDANCE_KEY, updated);
      safeDispatch(WF_ATTENDANCE_CHANGED);
    },
    [myMember],
  );

  const handleExit = useCallback(() => {
    if (!myMember) return;

    workforceGroupMemberService.exitMember(myMember.id, exitReason, exitNote);
    setExitDone(true);
  }, [exitNote, exitReason, myMember]);

  if (!group) {
    return <EmployeeWorkforceGroupNotFound onBack={onBack} />;
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <EmployeeWorkforceGroupHeader group={group} onBack={onBack} />

      <EmployeeWorkforceGroupTabs tab={tab} onChange={setTab} />

      {tab === "chat" && (
        <EmployeeWorkforceGroupChatPanel
          group={group}
          messages={messages}
          myId={myId}
          myMemberExists={myMember !== null}
          msgText={msgText}
          msgError={msgError}
          chatEndRef={chatEndRef}
          onMessageChange={setMsgText}
          onClearError={() => setMsgError("")}
          onSendMessage={sendMessage}
        />
      )}

      {tab === "shifts" && myMember && (
        <EmployeeWorkforceGroupShiftsPanel
          group={group}
          myMember={myMember}
          getMyAttendance={getMyAttendance}
          onSignIn={signIn}
          onSignOut={signOut}
        />
      )}

      {tab === "exit" && myMember && (
        <EmployeeWorkforceGroupExitPanel
          exitReason={exitReason}
          exitNote={exitNote}
          exitConfirm={exitConfirm}
          exitDone={exitDone}
          onReasonChange={setExitReason}
          onNoteChange={setExitNote}
          onRequestExit={() => setExitConfirm(true)}
          onConfirmExit={handleExit}
          onCancelExit={() => setExitConfirm(false)}
          onBack={onBack}
        />
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
