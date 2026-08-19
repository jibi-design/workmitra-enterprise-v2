/** Job Mitra | ShiftOpsInviteLandingPage.tsx | Static group link + Daily OTP join (+ legacy TTL invite) */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { ShiftOpsJoinFallbackPanel } from "../components/ShiftOpsJoinFallbackPanel";
import {
  classifyGroupJoinError,
  extractErrorMessage,
  type GroupJoinErrorInfo,
} from "../helpers/groupJoinErrors";
import { joinSiteViaGroupLink, peekGroupFromStaticLink } from "../services/groupDailyOtp.service";
import { ensureShiftOpsUser } from "../services/identity.service";
import { joinSiteViaInvite } from "../services/onboarding.service";
import {
  clearPendingGroupJoin,
  peekPendingGroupJoin,
  stashPendingGroupJoin,
} from "../storage/pendingGroupJoin.storage";
import { requireShiftOpsChannelOtpVerify } from "../../../shared/config/featureFlags";
import { ShiftOpsDualVerifyPage } from "./ShiftOpsDualVerifyPage";
import { ShiftOpsPendingApprovalPage } from "./ShiftOpsPendingApprovalPage";

type Step = "verify" | "joining" | "pending" | "error";

export function ShiftOpsInviteLandingPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tokenFromUrl = useMemo(() => params.get("token") ?? params.get("invite") ?? "", [params]);
  const groupHint = useMemo(() => params.get("group") ?? "", [params]);
  const legacyFromUrl = useMemo(() => params.get("legacy") === "1", [params]);

  const restored = useMemo(() => peekPendingGroupJoin(), []);
  const initialToken = tokenFromUrl || restored?.token || "";
  const initialGroup = groupHint || restored?.groupId || "";
  const initialLegacy = legacyFromUrl || (restored ? restored.useDailyOtpGate === false : false);

  const [token, setToken] = useState(initialToken);
  const [dailyOtp, setDailyOtp] = useState("");
  const [useDailyOtpGate] = useState(!initialLegacy);
  const [peekedLabel, setPeekedLabel] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("verify");
  const [errorInfo, setErrorInfo] = useState<GroupJoinErrorInfo | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);

  const fallbackLabel = useMemo(() => {
    if (!initialGroup) return null;
    return `Group ${initialGroup.slice(0, 8)}…`;
  }, [initialGroup]);

  const groupLabel = peekedLabel ?? (!token.trim() || !useDailyOtpGate ? fallbackLabel : null);

  useEffect(() => {
    if (!tokenFromUrl) return;
    queueMicrotask(() => setToken(tokenFromUrl));
  }, [tokenFromUrl]);

  useEffect(() => {
    const trimmed = token.trim();
    if (!trimmed) return;
    stashPendingGroupJoin({
      token: trimmed,
      groupId: (groupHint || restored?.groupId || "").trim() || undefined,
      companyName: restored?.companyName,
      useDailyOtpGate,
      savedAt: Date.now(),
    });
  }, [token, useDailyOtpGate, groupHint, restored?.groupId, restored?.companyName]);

  useEffect(() => {
    const trimmed = token.trim();
    if (!trimmed || !useDailyOtpGate) {
      queueMicrotask(() => setPeekedLabel(null));
      return;
    }
    let cancelled = false;
    void peekGroupFromStaticLink(trimmed)
      .then((peek) => {
        if (cancelled) return;
        if (!peek.is_active) {
          setPeekedLabel(`${peek.group_name} (inactive)`);
          setErrorInfo(classifyGroupJoinError("group_inactive"));
          setStep("error");
          return;
        }
        setPeekedLabel(peek.group_name);
        setErrorInfo(null);
        setStep((s) => (s === "error" ? "verify" : s));
        stashPendingGroupJoin({
          token: trimmed,
          groupId: peek.group_id || (groupHint || restored?.groupId || "").trim() || undefined,
          companyName: peek.group_name,
          useDailyOtpGate,
          savedAt: Date.now(),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const info = classifyGroupJoinError(extractErrorMessage(err));
        setPeekedLabel(fallbackLabel);
        if (info.terminal) {
          setErrorInfo(info);
          setStep("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, useDailyOtpGate, fallbackLabel, groupHint, restored?.groupId]);

  function resetJoinForm() {
    setStep("verify");
    setErrorInfo(null);
    setDailyOtp("");
  }

  async function submitJoin() {
    setErrorInfo(null);
    setStep("joining");
    try {
      await ensureShiftOpsUser("worker");
      const id = useDailyOtpGate
        ? await joinSiteViaGroupLink(token, dailyOtp)
        : await joinSiteViaInvite(token.trim());
      clearPendingGroupJoin();
      setMembershipId(id);
      setStep("pending");
    } catch (err) {
      const info = classifyGroupJoinError(extractErrorMessage(err));
      if (info.code === "dual_verification_required") {
        setStep("verify");
        setErrorInfo(info);
        return;
      }
      setErrorInfo(info);
      setStep("error");
    }
  }

  if (step === "pending") {
    return <ShiftOpsPendingApprovalPage membershipId={membershipId} />;
  }

  if (step === "error" && errorInfo?.terminal) {
    return (
      <div className="wm-ee-vShift wm-stackGrid" data-testid="shift-ops-invite-landing">
        <ShiftOpsJoinFallbackPanel info={errorInfo} onRetry={resetJoinForm} />
      </div>
    );
  }

  function tryJoinFromForm() {
    if (!token.trim()) {
      setErrorInfo({
        code: "group_link_invalid",
        title: "Link required",
        message:
          "Open this page from your manager’s group link or QR. The group token is never entered manually.",
        terminal: false,
      });
      return;
    }
    if (useDailyOtpGate && dailyOtp.trim().length !== 6) {
      setErrorInfo({
        code: "daily_otp_invalid",
        title: "Enter today’s code",
        message: "Enter today’s 6-digit Active Daily OTP from your manager.",
        terminal: false,
      });
      return;
    }
    void submitJoin();
  }

  return (
    <div className="wm-ee-vShift wm-stackGrid" data-testid="shift-ops-invite-landing">
      {requireShiftOpsChannelOtpVerify ? (
        <ShiftOpsDualVerifyPage onComplete={tryJoinFromForm} />
      ) : null}

      <section className="wm-ee-card" style={{ maxWidth: 480 }} data-testid="shift-ops-group-join">
        <div className="wm-pageSub">Group join</div>
        <p style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>
          {requireShiftOpsChannelOtpVerify
            ? "After channel verification, enter today’s Active Daily OTP from your manager. The group link is taken from the QR/URL only — no token paste field."
            : "Enter today’s Active Daily OTP from your manager. The group link is taken from the QR/URL only."}
        </p>
        {groupLabel ? (
          <p
            style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}
            data-testid="shift-ops-group-label"
          >
            {groupLabel}
          </p>
        ) : null}
        {!token.trim() ? (
          <div
            className="wm-ent-empty"
            role="status"
            data-testid="shift-ops-group-link-missing"
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(248,250,252,0.9)",
              fontSize: 12,
              fontWeight: 650,
              color: "#64748b",
              lineHeight: 1.45,
            }}
          >
            Waiting for a group link. Scan your manager’s QR or open the invite URL to continue.
          </div>
        ) : null}
        {useDailyOtpGate ? (
          <input
            className="wm-input"
            style={{ width: "100%", marginTop: 8 }}
            value={dailyOtp}
            onChange={(e) => setDailyOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Today’s Daily OTP (6 digits)"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Today’s Daily OTP"
            data-testid="shift-ops-daily-otp-input"
            disabled={!token.trim()}
          />
        ) : null}
        {!requireShiftOpsChannelOtpVerify ? (
          <button
            type="button"
            className="wm-primarybtn"
            style={{ marginTop: 12, width: "100%" }}
            data-testid="shift-ops-join-submit"
            disabled={step === "joining" || !token.trim()}
            onClick={tryJoinFromForm}
          >
            {step === "joining" ? "Submitting…" : "Request to join group"}
          </button>
        ) : null}
        {legacyFromUrl ? (
          <p
            style={{ marginTop: 10, fontSize: 12, color: "var(--wm-neutral-500)", fontWeight: 650 }}
            data-testid="shift-ops-legacy-invite-note"
          >
            Legacy invite mode (no daily OTP).
          </p>
        ) : null}
        {errorInfo && !errorInfo.terminal ? (
          <div style={{ marginTop: 8 }}>
            <div
              role="alert"
              data-testid={`shift-ops-join-soft-error-${errorInfo.code}`}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(185,28,28,0.06)",
                border: "1px solid rgba(185,28,28,0.18)",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <strong>{errorInfo.title}.</strong> {errorInfo.message}
            </div>
            {errorInfo.code === "dual_verification_required" ? (
              <button
                type="button"
                className="wm-primarybtn"
                data-testid="shift-ops-goto-profile-verify"
                style={{ marginTop: 10 }}
                onClick={() => nav(ROUTE_PATHS.employeeProfile)}
              >
                Go to Profile → Verify Channels
              </button>
            ) : null}
          </div>
        ) : null}
        {step === "joining" ? (
          <p style={{ fontSize: 13, marginTop: 8 }}>Submitting for manager approval…</p>
        ) : null}
        {step === "error" && errorInfo && !errorInfo.terminal ? (
          <button
            type="button"
            className="wm-outlineBtn"
            style={{ marginTop: 8 }}
            onClick={resetJoinForm}
          >
            Try again
          </button>
        ) : null}
      </section>
    </div>
  );
}
