// App name: Job Mitra
// Double-confirmation modals for direct shift invites (fat-finger guard).

import { CenterModal } from "../../../../shared/components/CenterModal";
import type { EmployeePendingDirectInvite } from "../helpers/shiftDirectInvite.helpers";

export type ShiftDirectInviteModalKind = "accept" | "decline";

export type ShiftDirectInviteModalState = {
  kind: ShiftDirectInviteModalKind;
  invite: EmployeePendingDirectInvite;
};

type Props = {
  modal: ShiftDirectInviteModalState | null;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ShiftDirectInviteSafetyModals({ modal, isBusy, onCancel, onConfirm }: Props) {
  if (!modal) return null;

  const { kind, invite } = modal;

  if (kind === "accept") {
    return (
      <CenterModal open onBackdropClose={onCancel} ariaLabel="Commit to shift" surface="bare">
        <div className="wm-shiftDirectInviteModal wm-shiftDirectInviteModal--accept">
          <div className="wm-shiftDirectInviteModal__title">Are you sure you want to commit?</div>
          <p className="wm-shiftDirectInviteModal__body">
            You are accepting a direct invite from <strong>{invite.companyName}</strong> for{" "}
            <strong>{invite.jobName}</strong> on <strong>{invite.shiftDateLabel}</strong>. This
            confirms you for the shift and opens your workspace group.
          </p>
          <p className="wm-shiftDirectInviteModal__warn">
            Canceling later may negatively impact your rating.
          </p>
          <div className="wm-shiftDirectInviteModal__actions">
            <button type="button" className="wm-outlineBtn" onClick={onCancel} disabled={isBusy}>
              Cancel
            </button>
            <button
              type="button"
              className="wm-primarybtn wm-shiftDirectInviteModal__commitBtn"
              onClick={onConfirm}
              disabled={isBusy}
              data-testid="shift-direct-invite-commit-btn"
            >
              {isBusy ? "Committing..." : "Yes, I Commit"}
            </button>
          </div>
        </div>
      </CenterModal>
    );
  }

  return (
    <CenterModal open onBackdropClose={onCancel} ariaLabel="Decline invite" surface="bare">
      <div className="wm-shiftDirectInviteModal wm-shiftDirectInviteModal--decline">
        <div className="wm-shiftDirectInviteModal__title">Decline Invite?</div>
        <p className="wm-shiftDirectInviteModal__body">
          Are you sure you want to pass on this shift from <strong>{invite.companyName}</strong> on{" "}
          <strong>{invite.shiftDateLabel}</strong>?
        </p>
        <div className="wm-shiftDirectInviteModal__actions">
          <button type="button" className="wm-outlineBtn" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button
            type="button"
            className="wm-shiftDirectInviteModal__declineBtn"
            onClick={onConfirm}
            disabled={isBusy}
            data-testid="shift-direct-invite-decline-confirm-btn"
          >
            {isBusy ? "Declining..." : "Yes, Decline"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
