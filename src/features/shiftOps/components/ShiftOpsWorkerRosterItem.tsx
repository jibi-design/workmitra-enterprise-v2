/**
 * Job Mitra | ShiftOpsWorkerRosterItem.tsx
 * Live roster row — name, role badge, shift meta + compact quick actions.
 */

import { Phone, MessageSquare, RefreshCw, Clock3 } from "lucide-react";
import type { ActiveGroupRosterRow } from "../types";
import { CallButton } from "../../shared/calling";
import {
  canCommunicateInShiftOpsGroup,
  shiftOpsCommsBlockedReason,
} from "../helpers/shiftOpsCommsGate.helpers";
import { sendShiftOpsGroupMessage } from "../services/rosterReassign.service";
import { SHIFT_OPS_CONTACT_LOCKED_MESSAGE } from "../privacy";
import { SlideOver } from "../../../shared/components/enterprise";
import { useState } from "react";

type Props = {
  row: ActiveGroupRosterRow;
  groupName: string;
  initiatorMl: string;
  onReassign: () => void;
  onEditShiftTime: () => void;
};

export function ShiftOpsWorkerRosterItem({
  row,
  groupName,
  initiatorMl,
  onReassign,
  onEditShiftTime,
}: Props) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState("");

  const allowed = canCommunicateInShiftOpsGroup({
    status: row.status,
    groupId: row.site_id,
    workerMlId: row.jobmitra_ml_id,
  });
  const blockReason = shiftOpsCommsBlockedReason({
    status: row.status,
    groupId: row.site_id,
    workerMlId: row.jobmitra_ml_id,
  });

  const initial = (row.display_name.trim().charAt(0) || "W").toUpperCase();
  const shiftTimeLabel = formatShiftMeta(row);
  const receiverMl = (row.jobmitra_ml_id ?? "").trim();

  return (
    <li
      className="wm-shiftOpsWorkerRow"
      data-testid={`shift-ops-roster-worker-${row.membership_id}`}
    >
      <div className="wm-shiftOpsWorkerRowMain">
        <div className="wm-shiftOpsWorkerAvatar" aria-hidden>
          {initial}
        </div>

        <div className="wm-shiftOpsWorkerMeta">
          <div className="wm-shiftOpsWorkerName">{row.display_name}</div>
          <div className="wm-shiftOpsWorkerBadges">
            <span className="wm-shiftOpsRoleBadge">{row.crew_role || "Crew"}</span>
            <span className="wm-shiftOpsShiftTime">
              <Clock3 size={12} strokeWidth={2.25} aria-hidden />
              {shiftTimeLabel}
            </span>
          </div>
          <div className="wm-shiftOpsWorkerZone">
            {row.assignment_zone} · {row.site_name || groupName}
          </div>
        </div>
      </div>

      <div className="wm-shiftOpsQuickActions" data-testid="shift-ops-group-comms">
        {allowed ? (
          <div className="wm-shiftOpsQuickCallWrap">
            <CallButton
              workspaceId={row.site_id.trim()}
              initiatorMl={initiatorMl}
              receiverMl={receiverMl}
              peerLabel={row.display_name}
              disabled={!initiatorMl}
            />
          </div>
        ) : (
          <button
            type="button"
            className="wm-shiftOpsActionPill"
            disabled
            title={blockReason}
            data-testid="shift-ops-call-locked"
          >
            <Phone size={14} strokeWidth={2.25} aria-hidden />
            Call
          </button>
        )}

        <button
          type="button"
          className="wm-shiftOpsActionPill"
          disabled={!allowed}
          title={allowed ? "In-app group message" : blockReason}
          data-testid="shift-ops-message-btn"
          onClick={() => {
            setSent("");
            setDraft("");
            setMessageOpen(true);
          }}
        >
          <MessageSquare size={14} strokeWidth={2.25} aria-hidden />
          Msg
        </button>

        <button
          type="button"
          className="wm-shiftOpsActionPill"
          data-testid="shift-ops-reassign-role-btn"
          onClick={onReassign}
        >
          <RefreshCw size={14} strokeWidth={2.25} aria-hidden />
          Reassign
        </button>

        <button
          type="button"
          className="wm-shiftOpsActionPill"
          data-testid="shift-ops-edit-shift-time-btn"
          title="Manage assignment (shift timers planned for v2.1)"
          onClick={onEditShiftTime}
        >
          <Clock3 size={14} strokeWidth={2.25} aria-hidden />
          Edit time
        </button>
      </div>

      {!allowed ? (
        <p className="wm-shiftOpsWorkerHint">
          {blockReason}. {SHIFT_OPS_CONTACT_LOCKED_MESSAGE}
        </p>
      ) : null}

      <SlideOver
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Group message"
        subtitle={`${row.display_name} · ${groupName}`}
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
                  groupId: row.site_id.trim(),
                  groupName,
                  receiverMl,
                  workerName: row.display_name,
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
          <div role="status" className="wm-shiftOpsInfoNote">
            {sent}
          </div>
        ) : null}
      </SlideOver>
    </li>
  );
}

function formatShiftMeta(row: ActiveGroupRosterRow): string {
  if (row.last_reassigned_at) {
    const d = new Date(row.last_reassigned_at);
    if (!Number.isNaN(d.getTime())) {
      return `Updated ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  }
  return "Active shift · time not set";
}
