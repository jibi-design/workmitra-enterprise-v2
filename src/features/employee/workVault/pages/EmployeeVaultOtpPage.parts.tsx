import type { VaultOTP } from "../types/vaultTypes";
import { VaultOtpDisplay } from "../components/VaultOtpDisplay";

type VaultOtpSectionProps = {
  otp: VaultOTP | null;
  onGenerate: () => void;
  onCancelOtp: () => void;
  onOtpExpired: () => void;
};

export function VaultOtpSection({
  otp,
  onGenerate,
  onCancelOtp,
  onOtpExpired,
}: VaultOtpSectionProps) {
  return (
    <section className="wm-vault-otp-card" data-testid="vault-otp-card">
      {otp ? (
        <>
          <div className="wm-vault-otp-card__eyebrow">Live access code</div>
          <div className="wm-vault-otp-card__hint">Share this code with the employer</div>

          {otp.code ? (
            <VaultOtpDisplay code={otp.code} expiresAt={otp.expiresAt} onExpired={onOtpExpired} />
          ) : (
            <div className="wm-vault-otp-card__once">
              Access code was shown once and is not stored. Generate a new code to share again.
              <div className="wm-vault-otp-card__once-meta">
                Expires {new Date(otp.expiresAt).toLocaleTimeString()}
              </div>
            </div>
          )}

          <div className="wm-vault-otp-actions">
            <button
              type="button"
              className="wm-vault-otp-btn wm-vault-otp-btn--primary"
              onClick={onGenerate}
            >
              New Code
            </button>
            <button
              type="button"
              className="wm-vault-otp-btn wm-vault-otp-btn--danger"
              onClick={onCancelOtp}
            >
              Cancel Code
            </button>
          </div>
        </>
      ) : (
        <div className="wm-vault-otp-empty">
          <div className="wm-vault-otp-card__eyebrow">No active session</div>
          <div className="wm-vault-otp-empty__title">No active access code</div>
          <div className="wm-vault-otp-empty__sub">
            Generate a 6-digit code to share with an employer. The code expires after 5 minutes and
            can only be used once.
          </div>
          <button
            type="button"
            className="wm-vault-otp-btn wm-vault-otp-btn--primary wm-vault-otp-btn--wide"
            onClick={onGenerate}
          >
            Generate Access Code
          </button>
        </div>
      )}
    </section>
  );
}
