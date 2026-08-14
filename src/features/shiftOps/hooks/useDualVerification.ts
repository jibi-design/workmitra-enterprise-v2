/** Job Mitra | shiftOps/hooks/useDualVerification.ts | Phase 1 dual OTP flow */

import { useCallback, useEffect, useState } from "react";
import {
  getContactVerificationState,
  markEmailVerified,
  markPhoneVerified,
  subscribeContactVerification,
} from "../../../shared/phone";
import { listMyChannelsSafe, upsertWorkChannel } from "../services/identity.service";
import { requestChannelOtp, verifyChannelOtp } from "../services/onboarding.service";
import type { ChannelsSafeRow } from "../types";

type DualVerifyState = {
  mobileChannelId: string | null;
  emailChannelId: string | null;
  channels: ChannelsSafeRow[];
  mobileVerified: boolean;
  emailVerified: boolean;
  busy: boolean;
  error: string | null;
  loading: boolean;
};

function seedFromProfile(): Pick<DualVerifyState, "mobileVerified" | "emailVerified"> {
  const v = getContactVerificationState();
  return {
    mobileVerified: v.phoneVerified === true,
    emailVerified: v.emailVerified === true,
  };
}

const initial: DualVerifyState = {
  mobileChannelId: null,
  emailChannelId: null,
  channels: [],
  ...seedFromProfile(),
  busy: false,
  error: null,
  loading: true,
};

function mapError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "Couldn't finish that. Try again.";
}

export function useDualVerification() {
  const [state, setState] = useState<DualVerifyState>(initial);

  const refresh = useCallback(async () => {
    const profile = getContactVerificationState();
    try {
      const channels = await listMyChannelsSafe();
      const mobile = channels.find((c) => c.kind === "work_mobile");
      const email = channels.find((c) => c.kind === "work_email");
      const mobileVerified = profile.phoneVerified === true || mobile?.status === "verified";
      const emailVerified = profile.emailVerified === true || email?.status === "verified";

      if (mobile?.status === "verified" && !profile.phoneVerified) {
        markPhoneVerified();
      }
      if (email?.status === "verified" && !profile.emailVerified) {
        markEmailVerified();
      }

      setState((s) => ({
        ...s,
        channels,
        mobileChannelId: mobile?.id ?? s.mobileChannelId,
        emailChannelId: email?.id ?? s.emailChannelId,
        mobileVerified,
        emailVerified,
        loading: false,
        error: null,
      }));
    } catch (err) {
      // Profile-verified users must still skip OTP when channel fetch fails.
      setState((s) => ({
        ...s,
        mobileVerified: profile.phoneVerified === true || s.mobileVerified,
        emailVerified: profile.emailVerified === true || s.emailVerified,
        loading: false,
        error: profile.phoneVerified && profile.emailVerified ? null : mapError(err),
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeContactVerification(() => {
      const v = getContactVerificationState();
      setState((s) => ({
        ...s,
        mobileVerified: v.phoneVerified === true || s.mobileVerified,
        emailVerified: v.emailVerified === true || s.emailVerified,
      }));
    });
  }, [refresh]);

  const registerMobile = useCallback(
    async (rawMobile: string) => {
      setState((s) => ({ ...s, busy: true, error: null }));
      try {
        const id = await upsertWorkChannel("work_mobile", rawMobile, true);
        await requestChannelOtp(id, "onboard");
        setState((s) => ({ ...s, mobileChannelId: id, busy: false }));
        await refresh();
      } catch (err) {
        setState((s) => ({ ...s, busy: false, error: mapError(err) }));
      }
    },
    [refresh],
  );

  const registerEmail = useCallback(
    async (rawEmail: string) => {
      setState((s) => ({ ...s, busy: true, error: null }));
      try {
        const id = await upsertWorkChannel("work_email", rawEmail, true);
        await requestChannelOtp(id, "onboard");
        setState((s) => ({ ...s, emailChannelId: id, busy: false }));
        await refresh();
      } catch (err) {
        setState((s) => ({ ...s, busy: false, error: mapError(err) }));
      }
    },
    [refresh],
  );

  const confirmOtp = useCallback(
    async (kind: "work_mobile" | "work_email", otp: string) => {
      const channelId = kind === "work_mobile" ? state.mobileChannelId : state.emailChannelId;
      if (!channelId) {
        setState((s) => ({ ...s, error: "Register the channel first" }));
        return false;
      }
      setState((s) => ({ ...s, busy: true, error: null }));
      try {
        const ok = await verifyChannelOtp(channelId, otp);
        if (!ok) {
          setState((s) => ({ ...s, busy: false, error: "Invalid OTP" }));
          return false;
        }
        if (kind === "work_mobile") markPhoneVerified();
        else markEmailVerified();
        setState((s) => ({
          ...s,
          busy: false,
          mobileVerified: kind === "work_mobile" ? true : s.mobileVerified,
          emailVerified: kind === "work_email" ? true : s.emailVerified,
        }));
        await refresh();
        return true;
      } catch (err) {
        setState((s) => ({ ...s, busy: false, error: mapError(err) }));
        return false;
      }
    },
    [refresh, state.emailChannelId, state.mobileChannelId],
  );

  const dualComplete = state.mobileVerified && state.emailVerified;

  return {
    ...state,
    dualComplete,
    refresh,
    registerMobile,
    registerEmail,
    confirmOtp,
  };
}
