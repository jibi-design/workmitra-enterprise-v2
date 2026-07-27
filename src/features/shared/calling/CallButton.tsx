/**
 * Job Mitra | Phase 3 Calling — Call button (no tel:/wa — platform lock)
 * Path: src/features/shared/calling/CallButton.tsx
 */

import { CallActivePanel } from "./CallActivePanel";
import { isCallingApiEnabled } from "./callingGateApi.service";
import { useAgoraCall } from "./useAgoraCall";

type Props = {
  workspaceId: string;
  initiatorMl: string;
  receiverMl: string;
  peerLabel?: string;
  disabled?: boolean;
  /** Optional FCM token for receiver push (when known). */
  receiverFcmToken?: string;
};

export function CallButton({
  workspaceId,
  initiatorMl,
  receiverMl,
  peerLabel,
  disabled = false,
  receiverFcmToken,
}: Props) {
  const call = useAgoraCall();
  const ready =
    Boolean(workspaceId.trim()) &&
    Boolean(initiatorMl.trim()) &&
    Boolean(receiverMl.trim()) &&
    isCallingApiEnabled();

  const busy = call.isBusy;

  return (
    <div style={{ display: "grid", gap: 0 }}>
      <button
        type="button"
        data-testid="call-worker-button"
        className="wm-outlineBtn"
        disabled={disabled || !ready || busy}
        aria-disabled={disabled || !ready || busy}
        title={
          !isCallingApiEnabled()
            ? "Enable auth backend to use in-app calling"
            : !ready
              ? "Worker or employer ID missing"
              : "Start in-app call"
        }
        style={{ fontSize: 12 }}
        onClick={() => {
          void call.initiate({
            workspaceId,
            initiatorMl,
            receiverMl,
            fcmToken: receiverFcmToken,
          });
        }}
      >
        {busy ? "Calling…" : "Call"}
      </button>

      <CallActivePanel call={call} peerLabel={peerLabel} />
    </div>
  );
}
