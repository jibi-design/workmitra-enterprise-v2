/** Job Mitra | ShiftOpsDualVerifyPage.tsx | Phase 1 — Work Mobile + Work Email OTP */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { requireShiftOpsChannelOtpVerify } from "../../../shared/config/featureFlags";
import { VaultStyleOtpDigits } from "../../../shared/components/otp/VaultStyleOtpDigits";
import { ContactVerifiedBadge, PhoneNumberField } from "../../../shared/phone";
import { useDualVerification } from "../hooks/useDualVerification";
import { SHIFT_OPS_CONTACT_LOCKED_MESSAGE } from "../privacy";

type Props = {
  /** When embedded (invite flow). Route mode navigates to invite continue path. */
  onComplete?: () => void;
};

export function ShiftOpsDualVerifyPage({ onComplete }: Props) {
  const nav = useNavigate();
  const flow = useDualVerification();
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  useEffect(() => {
    if (requireShiftOpsChannelOtpVerify) return;
    if (onComplete) {
      onComplete();
      return;
    }
    nav(ROUTE_PATHS.employeeShiftOpsHub, { replace: true });
  }, [nav, onComplete]);

  if (!requireShiftOpsChannelOtpVerify) {
    return null;
  }

  function handleContinue() {
    if (onComplete) {
      onComplete();
      return;
    }
    nav(ROUTE_PATHS.employeeShiftOpsInvite);
  }

  const otpError = Boolean(flow.error);

  return (
    <section
      className="wm-ee-card wm-ee-vShift"
      data-testid="shift-ops-dual-verify"
      style={{ maxWidth: 480 }}
    >
      <div className="wm-pageSub">Shift Ops onboarding</div>
      <h1 className="wm-ee-cardTitle" style={{ fontSize: 18, marginTop: 4 }}>
        Verify work channels
      </h1>
      <p style={{ fontSize: 12, color: "var(--wm-neutral-500)", lineHeight: 1.45 }}>
        Use your <strong>work</strong> mobile and <strong>work</strong> email — not personal
        contacts.
        {SHIFT_OPS_CONTACT_LOCKED_MESSAGE}
      </p>

      {flow.loading ? (
        <div
          className="wm-ent-skeleton"
          data-testid="dual-verify-loading"
          style={{ marginTop: 16, height: 120, borderRadius: 12 }}
          aria-busy="true"
        />
      ) : null}

      {flow.error ? (
        <div
          role="alert"
          className="wm-ent-error"
          style={{
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.2)",
            fontSize: 13,
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {flow.error}
        </div>
      ) : null}

      {!flow.loading ? (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Work mobile</span>
            {flow.mobileVerified ? (
              <ContactVerifiedBadge channel="phone" testId="dual-verify-phone-badge" />
            ) : (
              <>
                <PhoneNumberField
                  value={mobile}
                  onChange={setMobile}
                  disabled={flow.busy}
                  placeholder="Mobile number"
                  testId="dual-verify-mobile"
                />
                <button
                  type="button"
                  className="wm-primarybtn"
                  disabled={flow.busy || mobile.replace(/\D/g, "").length < 8}
                  onClick={() => void flow.registerMobile(mobile)}
                >
                  Send mobile OTP
                </button>
                <div
                  className="wm-vault-otp-verify wm-vault-otp-verify--compact"
                  data-testid="dual-verify-mobile-otp"
                >
                  <div className="wm-vault-otp-verify__badge">
                    <span aria-hidden="true">▣</span> Mobile OTP
                  </div>
                  <VaultStyleOtpDigits
                    value={mobileOtp}
                    onChange={setMobileOtp}
                    error={otpError}
                    disabled={flow.busy}
                    labelPrefix="Mobile OTP digit"
                  />
                  <div className="wm-vault-otp-verify__actions" style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="wm-vault-cta wm-vault-otp-verify__submit"
                      disabled={flow.busy || mobileOtp.trim().length < 4}
                      onClick={() => void flow.confirmOtp("work_mobile", mobileOtp)}
                    >
                      Verify mobile
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Work email</span>
            {flow.emailVerified ? (
              <ContactVerifiedBadge channel="email" testId="dual-verify-email-badge" />
            ) : (
              <>
                <input
                  className="wm-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={flow.busy}
                  aria-label="Work email"
                />
                <button
                  type="button"
                  className="wm-primarybtn"
                  disabled={flow.busy || !email.includes("@")}
                  onClick={() => void flow.registerEmail(email)}
                >
                  Send email OTP
                </button>
                <div
                  className="wm-vault-otp-verify wm-vault-otp-verify--compact"
                  data-testid="dual-verify-email-otp"
                >
                  <div className="wm-vault-otp-verify__badge">
                    <span aria-hidden="true">▣</span> Email OTP
                  </div>
                  <VaultStyleOtpDigits
                    value={emailOtp}
                    onChange={setEmailOtp}
                    error={otpError}
                    disabled={flow.busy}
                    labelPrefix="Email OTP digit"
                  />
                  <div className="wm-vault-otp-verify__actions" style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="wm-vault-cta wm-vault-otp-verify__submit"
                      disabled={flow.busy || emailOtp.trim().length < 4}
                      onClick={() => void flow.confirmOtp("work_email", emailOtp)}
                    >
                      Verify email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="wm-primarybtn"
        style={{ marginTop: 20, width: "100%" }}
        disabled={!flow.dualComplete || flow.busy || flow.loading}
        onClick={handleContinue}
      >
        Continue
      </button>
    </section>
  );
}
