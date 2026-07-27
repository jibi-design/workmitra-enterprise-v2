/**
 * Job Mitra | Phase 3 Calling — active call panel
 * Path: src/features/shared/calling/CallActivePanel.tsx
 */

import type { UseAgoraCallResult } from "./useAgoraCall";

type Props = {
  call: UseAgoraCallResult;
  peerLabel?: string;
};

function statusLabel(status: UseAgoraCallResult["status"]): string {
  switch (status) {
    case "ringing":
      return "Ringing…";
    case "connecting":
      return "Connecting…";
    case "connected":
      return "Connected";
    case "failed":
      return "Connection failed";
    case "declined":
      return "Call declined";
    case "ended":
      return "Ended";
    default:
      return "";
  }
}

export function CallActivePanel({ call, peerLabel }: Props) {
  if (call.status === "idle") return null;

  const label = statusLabel(call.status);
  const showControls =
    call.status === "ringing" || call.status === "connecting" || call.status === "connected";
  const isAlert = call.status === "failed" || call.status === "declined";

  return (
    <div
      data-testid="call-active-panel"
      role="dialog"
      aria-label="Active call"
      className="wm-call-glassPanel"
      style={{
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: 18,
        border: "1px solid rgba(8,145,178,0.22)",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        boxShadow: "0 14px 32px rgba(8,145,178,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(8,145,178,0.12)",
            border: "1px solid rgba(8,145,178,0.22)",
            color: "#0e7490",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 0.2,
          }}
        >
          {(peerLabel?.trim().charAt(0) || "C").toUpperCase()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>
            In-app call{peerLabel ? ` · ${peerLabel}` : ""}
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: isAlert ? "rgba(185,28,28,0.08)" : "rgba(8,145,178,0.1)",
              border: isAlert ? "1px solid rgba(185,28,28,0.22)" : "1px solid rgba(8,145,178,0.22)",
              color: isAlert ? "#b91c1c" : "#0e7490",
            }}
          >
            {(call.status === "ringing" || call.status === "connecting") && (
              <span
                className="wm-call-pulseDot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#0891b2",
                }}
              />
            )}
            {label}
          </span>
        </div>
      </div>

      {call.error && (
        <div
          style={{
            marginTop: 10,
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            color: "#b91c1c",
            background: "rgba(185,28,28,0.06)",
            border: "1px solid rgba(185,28,28,0.18)",
          }}
        >
          {call.error}
        </div>
      )}

      {showControls && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={() => void call.toggleMute()}
            disabled={call.status !== "connected"}
            style={{ fontSize: 12 }}
          >
            {call.muted ? "Unmute mic" : "Mute mic"}
          </button>
          <button
            type="button"
            data-testid="call-end-btn"
            className="wm-dangerBtn"
            onClick={() => void call.end("ended")}
            style={{ fontSize: 12 }}
          >
            End call
          </button>
        </div>
      )}

      {(call.status === "ended" || call.status === "failed" || call.status === "declined") && (
        <button
          type="button"
          className="wm-outlineBtn"
          style={{ marginTop: 10, fontSize: 12 }}
          onClick={call.reset}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
