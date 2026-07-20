/** Contact verification panel — demo OTP for Level 1 trust. */

import { useState, type CSSProperties } from "react";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import {
  clearContactOtp,
  requestContactOtp,
  resolveContactVerificationTarget,
  verifyContactOtp,
} from "../../services/employerContactVerification.service";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";

type Props = {
  readonly profile: EmployerProfile;
  readonly onVerified: () => void;
  readonly onNotice: (notice: NoticeData) => void;
};

export function ContactVerificationPanel({ profile, onVerified, onNotice }: Props) {
  const target = resolveContactVerificationTarget(profile);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (profile.contactVerified) {
    return (
      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 14,
          background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.2)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, color: "#15803d" }}>Contact verified</div>
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          You can publish job posts. Verified badge still needs document review.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(226,232,240,0.9)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>Verify phone or email</div>
      <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Level 1 unlocks job post publishing. Phase-0 uses a demo code on this device.
      </div>

      {target ? (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#334155" }}>
          Sending to: {target}
        </div>
      ) : (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#b45309" }}>
          Add phone or email under Your account first.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={!target || sending}
          onClick={() => {
            if (!target) return;
            setSending(true);
            const result = requestContactOtp(target);
            setSending(false);
            if (!result.success) {
              onNotice({ title: "Could not send", message: result.reason, tone: "warn" });
              return;
            }
            onNotice({
              title: "Demo code sent",
              message: `Phase-0 demo OTP: ${result.demoCode}\n(In production this would go to your phone/email.)`,
              tone: "success",
            });
          }}
          style={actionBtnStyle}
        >
          {sending ? "Sending…" : "Send code"}
        </button>

        <button
          type="button"
          onClick={() => {
            clearContactOtp();
            setOtpCode("");
            onNotice({ title: "Cleared", message: "OTP cleared on this device.", tone: "success" });
          }}
          style={{ ...actionBtnStyle, background: "rgba(248,250,252,0.95)", color: "#64748b" }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          disabled={!target}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 10,
            border: "1px solid #d1d5db",
            padding: "0 12px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        />
        <button
          type="button"
          disabled={!target || otpCode.length < 6 || verifying}
          onClick={() => {
            if (!target) return;
            setVerifying(true);
            const result = verifyContactOtp(target, otpCode);
            setVerifying(false);
            if (!result.success) {
              onNotice({ title: "Verification failed", message: result.reason, tone: "warn" });
              return;
            }
            setOtpCode("");
            onVerified();
            onNotice({
              title: "Contact verified",
              message: "You can now publish job posts.",
              tone: "success",
            });
          }}
          style={{ ...actionBtnStyle, background: "#7c3aed", color: "#fff" }}
        >
          {verifying ? "Checking…" : "Verify"}
        </button>
      </div>
    </div>
  );
}

const actionBtnStyle: CSSProperties = {
  height: 38,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(124,58,237,0.08)",
  color: "#7c3aed",
  fontSize: 12,
  fontWeight: 800,
  padding: "0 14px",
  cursor: "pointer",
};
