// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupChatPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupChatPanel.tsx

import type { RefObject } from "react";
import type {
  WorkforceGroup,
  WorkforceMessage,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { WorkforceGroupMessageBubble } from "../../../../shared/domains/workforce/ui/WorkforceGroupMessageBubble";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  group: WorkforceGroup;
  messages: WorkforceMessage[];
  myId: string;
  myMemberExists: boolean;
  msgText: string;
  msgError: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onMessageChange: (value: string) => void;
  onClearError: () => void;
  onSendMessage: () => void;
};

export function EmployeeWorkforceGroupChatPanel({
  group,
  messages,
  myId,
  myMemberExists,
  msgText,
  msgError,
  chatEndRef,
  onMessageChange,
  onClearError,
  onSendMessage,
}: Props) {
  return (
    <div style={{ marginTop: 12 }}>
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
        {messages.length === 0 && (
          <div
            style={{ textAlign: "center", padding: 32, fontSize: 13, color: "var(--wm-er-muted)" }}
          >
            No messages yet. Say hello to your team.
          </div>
        )}

        {messages.map((message) => (
          <WorkforceGroupMessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === myId}
          />
        ))}

        <div ref={chatEndRef} />
      </div>

      {group.status === "active" && myMemberExists && (
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <input
            type="text"
            className="wm-input"
            placeholder="Type a message..."
            value={msgText}
            onChange={(event) => {
              onMessageChange(event.target.value);
              onClearError();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSendMessage();
            }}
            style={{ flex: 1, fontSize: 13 }}
            maxLength={500}
          />

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onSendMessage}
            disabled={!msgText.trim()}
            style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}
          >
            Send
          </button>
        </div>
      )}

      {msgError && (
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{msgError}</div>
      )}
    </div>
  );
}
