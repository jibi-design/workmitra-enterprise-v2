// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceGroupPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\pages\EmployerWorkforceGroupPage.tsx

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type {
  WorkforceGroup,
  WorkforceGroupMember,
  WorkforceMessage,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  readMembers,
  readMessages,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  safeDispatch,
  safeWrite,
  uid,
  WF_ATTENDANCE_CHANGED,
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
  WF_MESSAGES_CHANGED,
  WF_MESSAGES_KEY,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { validateMessage } from "../../../../shared/domains/workforce/validation/workforceValidation";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { EmployerWorkforceGroupChatPanel } from "../components/EmployerWorkforceGroupChatPanel";
import { EmployerWorkforceGroupCompletePanel } from "../components/EmployerWorkforceGroupCompletePanel";
import { EmployerWorkforceGroupHeader } from "../components/EmployerWorkforceGroupHeader";
import { EmployerWorkforceGroupRatingBanner } from "../components/EmployerWorkforceGroupRatingBanner";
import { EmployerWorkforceGroupTabs } from "../components/EmployerWorkforceGroupTabs";
import type { EmployerWorkforceGroupTab } from "../components/EmployerWorkforceGroupTabs";
import { GroupAttendanceTab } from "../components/GroupAttendanceTab";
import { GroupMembersTab } from "../components/GroupMembersTab";
import { workforceGroupMemberService } from "../services/workforceGroupMemberService";
import { workforceGroupService } from "../services/workforceGroupService";

type Props = {
  groupId: string;
  onBack: () => void;
  onOpenRating?: (groupId: string) => void;
};

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
    const members =
      readMembers(WF_MEMBERS_CHANGED).length > -1
        ? workforceGroupMemberService.getMembersForGroup(gId)
        : [];
    const messages = readMessages(WF_MESSAGES_KEY).filter((message) => message.groupId === gId);

    snapCache = { group, members, messages, ver: snapVer };
    return snapCache;
  };
}

function subscribe(cb: () => void): () => void {
  const events = [
    WF_GROUPS_CHANGED,
    WF_MEMBERS_CHANGED,
    WF_MESSAGES_CHANGED,
    WF_ATTENDANCE_CHANGED,
  ];

  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  window.addEventListener("storage", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    window.removeEventListener("storage", handler);
  };
}

export function EmployerWorkforceGroupPage({ groupId, onBack, onOpenRating }: Props) {
  const snapshotFn = useMemo(() => getSnapshot(groupId), [groupId]);
  const data = useSyncExternalStore(subscribe, snapshotFn, snapshotFn);

  const [tab, setTab] = useState<EmployerWorkforceGroupTab>("chat");
  const [msgText, setMsgText] = useState("");
  const [msgError, setMsgError] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data.messages.length, tab]);

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

  const handleComplete = useCallback(() => {
    const result = workforceGroupService.completeGroup(groupId);

    if (result.success) {
      setConfirmComplete(false);
      snapVer++;
      onOpenRating?.(groupId);
    }
  }, [groupId, onOpenRating]);

  const refreshData = useCallback(() => {
    snapVer++;
  }, []);

  if (!data.group) {
    return (
      <div className="wm-er-vWorkforce">
        <DomainHero
          variant="workforce"
          audience="employer"
          icon={
            <button
              type="button"
              className="wm-domainHeroIconBtn"
              onClick={onBack}
              aria-label="Back"
            >
              <IconBack />
            </button>
          }
          title="Group not found"
          subtitle="This work group may have been removed"
          description="Return to Work Groups to continue."
        />
      </div>
    );
  }

  const group = data.group;
  const activeMembers = data.members.filter((member) => member.status === "active").length;
  const unratedMembers = data.members.filter(
    (member) =>
      member.status === "active" &&
      !(typeof member.postEventRating === "number" && member.postEventRating > 0),
  );

  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceGroupHeader group={group} activeMembers={activeMembers} onBack={onBack} />

      <EmployerWorkforceGroupTabs
        tab={tab}
        messageCount={data.messages.length}
        activeMembers={activeMembers}
        onChange={setTab}
      />

      <div style={{ marginTop: 12 }}>
        {tab === "chat" && (
          <EmployerWorkforceGroupChatPanel
            group={group}
            messages={data.messages}
            msgText={msgText}
            msgError={msgError}
            chatEndRef={chatEndRef}
            onMessageChange={setMsgText}
            onClearError={() => setMsgError("")}
            onSendMessage={sendMessage}
          />
        )}

        {tab === "members" && (
          <GroupMembersTab group={group} members={data.members} onRefresh={refreshData} />
        )}

        {tab === "attendance" && <GroupAttendanceTab group={group} members={data.members} />}
      </div>

      {group.status === "active" && (
        <EmployerWorkforceGroupCompletePanel
          confirmComplete={confirmComplete}
          onRequestComplete={() => setConfirmComplete(true)}
          onConfirmComplete={handleComplete}
          onCancelComplete={() => setConfirmComplete(false)}
        />
      )}

      {group.status === "completed" && (
        <EmployerWorkforceGroupRatingBanner
          groupId={groupId}
          unratedCount={unratedMembers.length}
          onOpenRating={onOpenRating}
        />
      )}

      {group.status === "active" || <div style={{ height: 24 }} />}
    </div>
  );
}
