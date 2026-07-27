/**
 * Job Mitra | ShiftOpsGroupCommsActions.tsx
 * Privacy-safe Call + Message — only for active group members (no phone/email).
 */

import { useState } from "react";
import { CallButton } from "../../shared/calling";
import {
  canCommunicateInShiftOpsGroup,
  shiftOpsCommsBlockedReason,
} from "../helpers/shiftOpsCommsGate.helpers";
import { sendShiftOpsGroupMessage } from "../services/rosterReassign.service";
import { SHIFT_OPS_CONTACT_LOCKED_MESSAGE } from "../privacy";
import { SlideOver } from "../../../shared/components/enterprise";

type Props = {
  groupId: string;
  groupName: string;
  workerMlId: string | null;
  workerName: string;
  membershipStatus: string;
  initiatorMl: string;
  /** Urgent contact emphasis (not live QR check-in — that is v2.1) */
  emergency?: boolean;
  /** Epoch ms — locks chat/call after shift end. */
  shiftEndAt?: number | null;
  /** Workspace lifecycle — terminal statuses lock chat/call. */
  workspaceStatus?: string | null;
};

export function ShiftOpsGroupCommsActions({
  groupId,
  groupName,
  workerMlId,
  workerName,
  membershipStatus,
  initiatorMl,
  emergency = false,
  shiftEndAt = null,
  workspaceStatus = null,
}: Props) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState("");

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
  const workspaceId = groupId.trim();

  return (
    <div style={{ display: "grid", gap: 6 }} data-testid="shift-ops-group-comms">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
        {allowed ? (
          <div style={{ minWidth: 88 }}>
            <CallButton
              workspaceId={workspaceId}
              initiatorMl={initiatorMl}
              receiverMl={receiverMl}
              peerLabel={workerName}
              disabled={!initiatorMl}
            />
            {emergency ? (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#b45309",
                }}
              >
                Urgent contact
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className="wm-outlineBtn"
            disabled
            title={blockReason}
            style={{ fontSize: 12, opacity: 0.55 }}
            data-testid="shift-ops-call-locked"
          >
            Call locked
          </button>
        )}

        <button
          type="button"
          className="wm-outlineBtn"
          style={{ fontSize: 12, opacity: allowed ? 1 : 0.55 }}
          disabled={!allowed}
          title={allowed ? "In-app group message" : blockReason}
          data-testid="shift-ops-message-btn"
          onClick={() => {
            setSent("");
            setDraft("");
            setMessageOpen(true);
          }}
        >
          Message
        </button>
      </div>

      {!allowed ? (
        <div style={{ fontSize: 11, color: "var(--wm-neutral-500)", lineHeight: 1.4 }}>
          {blockReason}. {SHIFT_OPS_CONTACT_LOCKED_MESSAGE}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "var(--wm-neutral-500)" }}>
          In-app only · contacts stay masked
        </div>
      )}

      <SlideOver
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Group message"
        subtitle={`${workerName} · ${groupName}`}
        testId="shift-ops-message-slideover"
        variant="default"
        footer={
          <>
            <button
              type="button"
              className="wm-primarybtn"
              disabled={!draft.trim() || !allowed}
              onClick={() => {
                sendShiftOpsGroupMessage({
                  groupId: workspaceId,
                  groupName,
                  receiverMl,
                  workerName,
                  body: draft,
                });
                setSent("Message queued in-app");
                setDraft("");
                window.setTimeout(() => setMessageOpen(false), 700);
              }}
            >
              Send in-app
            </button>
            <button type="button" className="wm-outlineBtn" onClick={() => setMessageOpen(false)}>
              Close
            </button>
          </>
        }
      >
        <p style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          {SHIFT_OPS_CONTACT_LOCKED_MESSAGE} Routing uses group + Mitra Lab ids only.
        </p>
        <textarea
          className="wm-input"
          style={{ width: "100%", minHeight: 96, marginTop: 10 }}
          placeholder="Message to worker…"
          value={draft}
          maxLength={400}
          onChange={(e) => setDraft(e.target.value)}
          data-testid="shift-ops-message-body"
        />
        {sent ? (
          <div
            role="status"
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 10,
              background: "rgba(8,145,178,0.08)",
              border: "1px solid rgba(8,145,178,0.2)",
              fontSize: 12,
              fontWeight: 700,
              color: "#0e7490",
            }}
          >
            {sent}
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}
