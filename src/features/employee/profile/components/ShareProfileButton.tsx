// src/features/employee/profile/components/ShareProfileButton.tsx
//
// "Share my profile" button — triggers Web Share API or clipboard copy.
// Shows brief success feedback. Reusable across Profile + Vault.

import { useState } from "react";
import { shareProfile } from "../services/profileShareService";
import type { ShareResult } from "../services/profileShareService";
import { getProfileCompletion } from "../services/profileCompletionService";

/* ------------------------------------------------ */
/* Feedback messages                                */
/* ------------------------------------------------ */
const FEEDBACK: Record<ShareResult, string> = {
  shared: "Shared!",
  copied: "Copied to clipboard!",
  error: "Could not share. Please try again.",
};

/* ------------------------------------------------ */
/* Icon                                             */
/* ------------------------------------------------ */
function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92Z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
type Props = {
  /** Compact icon-only mode for tight spaces (e.g. Vault header) */
  compact?: boolean;
};

export function ShareProfileButton({ compact }: Props) {
  const [feedback, setFeedback] = useState<ShareResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    const result = await shareProfile();
    setFeedback(result);
    setBusy(false);
    setTimeout(() => setFeedback(null), 2500);
  }

  if (compact) {
    return (
      <div style={{ position: "relative", display: "inline-flex" }}>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          aria-label="Share profile"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1px solid var(--wm-er-border)",
            background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--wm-brand-600, #1d4ed8)",
          }}
        >
          <IconShare />
        </button>
        {feedback && (
          <span style={{
            position: "absolute", top: -6, right: -8,
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999,
            background: feedback === "error" ? "var(--wm-error)" : "var(--wm-success)",
            color: "#fff", whiteSpace: "nowrap",
          }}>
            {feedback === "error" ? "!" : "\u2713"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12,
          border: "1px solid var(--wm-er-accent-career, #1d4ed8)",
          background: "rgba(29,78,216,0.06)",
          color: "var(--wm-er-accent-career, #1d4ed8)",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <IconShare />
        {busy ? "Sharing..." : "Share my profile"}
      </button>
      {feedback && (
        <div style={{
          marginTop: 6, fontSize: 12, fontWeight: 600, textAlign: "center",
          color: feedback === "error" ? "var(--wm-error)" : "var(--wm-success, #16a34a)",
        }}>
          {FEEDBACK[feedback]}
        </div>
      )}
      {!feedback && !getProfileCompletion().isComplete && (
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", textAlign: "center" }}>
          Tip: Complete your profile for better responses
        </div>
      )}
    </div>
  );
}