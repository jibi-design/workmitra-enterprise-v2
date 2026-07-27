/**
 * Job Mitra | GatedCallButton.tsx
 * Call only when formal Shift Ops membership is ready_for_assignment
 * and the shift/workspace window is still open.
 */

import { CallButton } from "./CallButton";
import {
  canCommunicateInShiftOpsGroup,
  shiftOpsCommsBlockedReason,
} from "../../shiftOps/helpers/shiftOpsCommsGate.helpers";

type Props = {
  /** Formal Shift Ops site / group UUID */
  groupId?: string | null;
  membershipStatus?: string | null;
  workerMlId?: string | null;
  initiatorMl: string;
  peerLabel?: string;
  /** Extra disable (e.g. completed workspace) */
  extraDisabled?: boolean;
  /** Epoch ms — locks call after shift end. */
  shiftEndAt?: number | null;
  /** Workspace lifecycle — terminal statuses lock call. */
  workspaceStatus?: string | null;
};

export function GatedCallButton({
  groupId,
  membershipStatus,
  workerMlId,
  initiatorMl,
  peerLabel,
  extraDisabled = false,
  shiftEndAt = null,
  workspaceStatus = null,
}: Props) {
  const gateInput = {
    status: membershipStatus,
    groupId,
    workerMlId,
    shiftEndAt,
    workspaceStatus,
  };
  const allowed = canCommunicateInShiftOpsGroup(gateInput);
  const blockReason = shiftOpsCommsBlockedReason(gateInput);
  const receiverMl = (workerMlId ?? "").trim();
  const site = (groupId ?? "").trim();

  if (!allowed) {
    return (
      <button
        type="button"
        className="wm-outlineBtn"
        disabled
        title={blockReason || "Call locked until active group membership"}
        style={{ fontSize: 12, opacity: 0.55 }}
        data-testid="call-worker-button-locked"
        aria-label="Call locked until worker is an active Shift Ops group member"
      >
        Call locked
      </button>
    );
  }

  return (
    <CallButton
      workspaceId={site}
      initiatorMl={initiatorMl}
      receiverMl={receiverMl}
      peerLabel={peerLabel}
      disabled={extraDisabled || !initiatorMl}
    />
  );
}
