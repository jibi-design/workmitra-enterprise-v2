// App name: Job Mitra
// File name: CareerApplicationStatusModals.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerApplicationStatusModals.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";

type CareerApplicationStatusModalsProps = {
  successOpen: boolean;
  errorMessage: string | null;
  withdrawOpen: boolean;
  jobTitle: string;
  companyName: string;
  onCloseError: () => void;
  onCloseWithdraw: () => void;
  onConfirmWithdraw: () => void;
};

const CAREER_MUTED = "#64748b";

export function CareerApplicationStatusModals({
  successOpen,
  errorMessage,
  withdrawOpen,
  jobTitle,
  companyName,
  onCloseError,
  onCloseWithdraw,
  onConfirmWithdraw,
}: CareerApplicationStatusModalsProps) {
  return (
    <>
      <CenterModal open={successOpen} ariaLabel="Success">
        <div style={{ padding: 24, textAlign: "center" }}>
          <div
            style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-career-success, #16a34a)" }}
          >
            Done
          </div>
          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8 }}>Redirecting...</div>
        </div>
      </CenterModal>

      <CenterModal open={errorMessage !== null} onBackdropClose={onCloseError} ariaLabel="Error">
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error)" }}>
            Cannot apply
          </div>
          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.5 }}>
            {errorMessage}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={onCloseError}>
              OK
            </button>
          </div>
        </div>
      </CenterModal>

      <CenterModal open={withdrawOpen} onBackdropClose={onCloseWithdraw} ariaLabel="Withdraw">
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--wm-error)" }}>
            Withdraw application?
          </div>

          <div style={{ fontSize: 14, color: CAREER_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Your application for <b>{formatDisplayTitle(jobTitle)}</b> at <b>{companyName}</b> will
            be withdrawn. The employer may stop processing your application after this.
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button className="wm-outlineBtn" type="button" onClick={onCloseWithdraw}>
              Cancel
            </button>

            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmWithdraw}
              style={{ background: "var(--wm-error)" }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </CenterModal>
    </>
  );
}

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
