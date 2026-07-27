// App name: Job Mitra
// File name: EmployeeCareerApplicationsModals.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";

const CAREER_MUTED = "#64748b";

export function EmployeeCareerApplicationsModals({
  withdrawJobId,
  withdrawJobTitle,
  declineJobId,
  declineJobTitle,
  actionError,
  onCloseWithdraw,
  onConfirmWithdraw,
  onCloseDecline,
  onConfirmDecline,
  onCloseActionError,
}: {
  withdrawJobId: string | null;
  withdrawJobTitle: string;
  declineJobId: string | null;
  declineJobTitle: string;
  actionError: string | null;
  onCloseWithdraw: () => void;
  onConfirmWithdraw: () => void;
  onCloseDecline: () => void;
  onConfirmDecline: () => void;
  onCloseActionError: () => void;
}) {
  return (
    <>
      <CenterModal
        open={withdrawJobId !== null}
        onBackdropClose={onCloseWithdraw}
        ariaLabel="Withdraw Application"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Withdraw application?
          </div>
          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Your application for <b>{withdrawJobTitle}</b> will be withdrawn. The employer may stop
            processing it after this.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={onCloseWithdraw}>
              Cancel
            </button>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmWithdraw}
              style={{
                background: "var(--wm-error, #dc2626)",
                borderColor: "var(--wm-error, #dc2626)",
              }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </CenterModal>

      <CenterModal
        open={declineJobId !== null}
        onBackdropClose={onCloseDecline}
        ariaLabel="Decline Offer"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Decline job offer?
          </div>
          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Your offer for <b>{declineJobTitle}</b> will be declined. This will close this
            application in your records. Continue only if you do not want to proceed with this
            offer.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={onCloseDecline}>
              Cancel
            </button>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmDecline}
              style={{
                background: "var(--wm-error, #dc2626)",
                borderColor: "var(--wm-error, #dc2626)",
              }}
            >
              Decline Offer
            </button>
          </div>
        </div>
      </CenterModal>

      <CenterModal
        open={actionError !== null}
        onBackdropClose={onCloseActionError}
        ariaLabel="Application Action Notice"
      >
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error, #dc2626)" }}>
            Action unavailable
          </div>
          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            {actionError}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={onCloseActionError}>
              OK
            </button>
          </div>
        </div>
      </CenterModal>
    </>
  );
}
