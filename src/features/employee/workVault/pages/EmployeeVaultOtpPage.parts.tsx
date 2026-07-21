import { VAULT_ACCENT } from "../constants/vaultConstants";
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
    <section className="wm-vault-otp-card" style={{ marginTop: 16 }}>
      {otp ? (
        <>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--wm-emp-muted)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Share this code with the employer
          </div>

          {otp.code ? (
            <VaultOtpDisplay code={otp.code} expiresAt={otp.expiresAt} onExpired={onOtpExpired} />
          ) : (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "var(--wm-emp-muted)",
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              Access code was shown once and is not stored. Generate a new code to share again.
              <div style={{ marginTop: 6, fontWeight: 700 }}>
                Expires {new Date(otp.expiresAt).toLocaleTimeString()}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button
              type="button"
              onClick={onGenerate}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 10,
                border: "none",
                background: VAULT_ACCENT,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              New Code
            </button>
            <button
              type="button"
              onClick={onCancelOtp}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 10,
                border: "1px solid rgba(220, 38, 38, 0.25)",
                background: "rgba(220, 38, 38, 0.08)",
                color: "#dc2626",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel Code
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--wm-emp-text)",
              marginBottom: 8,
            }}
          >
            No active access code
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--wm-emp-muted)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Generate a 6-digit code to share with an employer. The code expires after 5 minutes and
            can only be used once.
          </div>
          <button
            type="button"
            onClick={onGenerate}
            style={{
              height: 44,
              padding: "0 28px",
              borderRadius: 12,
              border: "none",
              background: VAULT_ACCENT,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Generate Access Code
          </button>
        </div>
      )}
    </section>
  );
}
