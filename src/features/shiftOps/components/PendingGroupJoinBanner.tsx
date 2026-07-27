/** Job Mitra | PendingGroupJoinBanner.tsx | Pending join nudge — surface-glass (Step 4) */

import { useNavigate } from "react-router-dom";
import {
  describePendingGroupJoin,
  resolvePendingGroupJoinOrchestration,
} from "../helpers/groupJoinDeepLink";
import { peekPendingGroupJoinPath } from "../storage/pendingGroupJoin.storage";

type Props = {
  onDismiss?: () => void;
};

export function PendingGroupJoinBanner({ onDismiss }: Props) {
  const nav = useNavigate();
  const pending = describePendingGroupJoin();
  const path = resolvePendingGroupJoinOrchestration() ?? peekPendingGroupJoinPath();

  if (!pending || !path) return null;

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-ee-vShift"
      data-testid="pending-group-join-banner"
      style={{
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div className="wm-ee-cardTitle" style={{ fontSize: 13, color: "#15803d" }}>
          You have a pending group join
        </div>
        <div className="wm-ee-cardSub" style={{ fontSize: 12, marginTop: 4 }}>
          {pending.groupId
            ? `Tap continue to finish joining group ${pending.groupId.slice(0, 8)}…`
            : "Tap continue to finish joining your site group."}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="wm-primarybtn"
          data-testid="pending-group-join-continue"
          style={{ fontSize: 12 }}
          onClick={() => nav(path)}
        >
          Continue Join
        </button>
        {onDismiss ? (
          <button
            type="button"
            className="wm-outlineBtn wm-shift-pressable"
            data-testid="pending-group-join-dismiss"
            style={{ fontSize: 12 }}
            onClick={onDismiss}
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}
