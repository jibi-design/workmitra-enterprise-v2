/**
 * Job Mitra | Phase 3 Calling — incoming call answer banner (employee)
 * Path: src/features/shared/calling/IncomingCallAnswerBanner.tsx
 */

import { useEffect, useMemo, useState } from "react";
import {
  consumeIncomingCall,
  subscribeIncomingCallFromNative,
  type IncomingCallPayload,
} from "./incomingCallBridge";
import { callingGateApi, isCallingApiEnabled } from "./callingGateApi.service";
import { CallActivePanel } from "./CallActivePanel";
import { useAgoraCall } from "./useAgoraCall";

export type IncomingCallerIdentityView = {
  initial: string;
  companyName: string;
};

type Props = {
  /** Current employee Mitra Lab id — required to answer. */
  partyMl: string;
  /** Optional workspace-derived employer identity (avoids hardcoded "E"). */
  resolveCaller?: (pending: IncomingCallPayload) => IncomingCallerIdentityView;
};

export function IncomingCallAnswerBanner({ partyMl, resolveCaller }: Props) {
  const call = useAgoraCall();
  const [pending, setPending] = useState<IncomingCallPayload | null>(() => consumeIncomingCall());
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    return subscribeIncomingCallFromNative((payload) => {
      setPending(payload);
    });
  }, []);

  const caller = useMemo<IncomingCallerIdentityView>(() => {
    if (!pending) return { initial: "E", companyName: "Employer" };
    if (resolveCaller) return resolveCaller(pending);
    return { initial: "E", companyName: "Employer" };
  }, [pending, resolveCaller]);

  if (!pending && call.status === "idle") return null;

  const ml = partyMl.trim().toUpperCase();
  const peerLabel = caller.companyName;

  return (
    <div
      data-testid="incoming-call-answer-banner"
      className="wm-call-incomingBanner"
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(22,163,74,0.28)",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        boxShadow: "0 0 0 3px rgba(22,163,74,0.08), 0 14px 32px rgba(22,163,74,0.12)",
        animation: "wm-callRingSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {pending && call.status === "idle" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              aria-hidden
              className="wm-shift-avatar"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                fontSize: 14,
              }}
            >
              {caller.initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-neutral-900)" }}>
                Incoming call from {peerLabel}
              </div>
              <div
                style={{
                  marginTop: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#15803d",
                }}
              >
                <span
                  className="wm-call-pulseDot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#16a34a",
                  }}
                />
                In-app only · Answer to connect
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="wm-primarybtn"
              style={{ fontSize: 12 }}
              disabled={!ml || !pending.callSessionId}
              onClick={() => {
                if (!pending.callSessionId || !ml) return;
                void call.answer({
                  callSessionId: pending.callSessionId,
                  partyMl: ml,
                });
                setPending(null);
              }}
            >
              Answer
            </button>
            <button
              type="button"
              className="wm-outlineBtn"
              style={{ fontSize: 12 }}
              disabled={declining || !pending.callSessionId}
              onClick={() => {
                if (!pending.callSessionId || !ml) {
                  setPending(null);
                  return;
                }
                setDeclining(true);
                const sessionId = pending.callSessionId;
                void (async () => {
                  try {
                    if (isCallingApiEnabled()) {
                      await callingGateApi.end({
                        callSessionId: sessionId,
                        partyMl: ml,
                        status: "declined",
                      });
                    }
                  } catch {
                    /* still dismiss UI */
                  } finally {
                    setDeclining(false);
                    setPending(null);
                  }
                })();
              }}
            >
              {declining ? "Declining…" : "Decline"}
            </button>
          </div>
        </>
      )}

      <CallActivePanel call={call} peerLabel={peerLabel} />
    </div>
  );
}
