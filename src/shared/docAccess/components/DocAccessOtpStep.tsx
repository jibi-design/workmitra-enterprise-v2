// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessOtpStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessOtpStep.tsx
// Step 2: Slate/glass chrome aligned to vault OTP recipe (no purple dialect).

import { DocAccessOtpInput } from "./DocAccessOtpInput";

type DocAccessOtpStepProps = {
  workerName: string;
  otpError: string;
  onSubmit: (code: string) => void;
  onClose: () => void;
};

export function DocAccessOtpStep({
  workerName,
  otpError,
  onSubmit,
  onClose,
}: DocAccessOtpStepProps) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div className="wm-vault-otp-verify__badge" style={{ marginBottom: 10 }}>
          <span aria-hidden="true">▣</span> Work Vault Verification
        </div>

        <div className="wm-vault-otp-verify__title" style={{ textAlign: "left" }}>
          Enter Employee Access Code
        </div>

        <div className="wm-vault-otp-verify__sub" style={{ textAlign: "left", marginBottom: 0 }}>
          This code is needed to view <strong>{workerName}</strong>&apos;s shared Work Vault
          documents. Ask the employee for the code before continuing.
        </div>
      </div>

      <div className="wm-doc-access-otp-guide">
        <div className="wm-doc-access-otp-guide__title">What you need to do</div>
        <div className="wm-doc-access-otp-guide__list">
          <GuideRow number="1" text={`Call or contact ${workerName}.`} />
          <GuideRow number="2" text="Ask the employee to open Work Vault → Share Access." />
          <GuideRow
            number="3"
            text="A request was sent automatically. The employee taps Generate Access Code."
          />
          <GuideRow number="4" text="Ask the employee to tell you the 6-digit code." />
          <GuideRow number="5" text="Type that code below and tap Verify & View Documents." />
        </div>
      </div>

      <div className="wm-doc-access-otp-note">
        You can view only the folders the employee marked as visible. The code works one time only
        and expires in 5 minutes.
      </div>

      <DocAccessOtpInput onSubmit={onSubmit} error={otpError} />

      <button
        type="button"
        className="wm-outlineBtn"
        onClick={onClose}
        style={{ width: "100%", marginTop: 10, minHeight: 44 }}
      >
        Cancel
      </button>
    </>
  );
}

function GuideRow({ number, text }: { number: string; text: string }) {
  return (
    <div className="wm-doc-access-otp-guide__row">
      <span className="wm-doc-access-otp-guide__num">{number}</span>
      <span className="wm-doc-access-otp-guide__text">{text}</span>
    </div>
  );
}
