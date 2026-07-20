/**
 * Job Mitra | GodModePanel.tsx
 * DEV-ONLY floating QA panel. import.meta.env.DEV is statically replaced
 * with `false` by Vite in production — Rollup dead-code-eliminates the
 * entire inner component, so this costs zero bytes in production builds.
 *
 * Mounted in main.tsx as a sibling to <App />.
 */

import { useState } from "react";
import { roleStorage } from "../app/storage/roleStorage";
import { usePulseStore } from "../features/pulse/pulseStore";
import { PulseEvent } from "../features/pulse/pulseEvents";
import { requestSplashReplay } from "../shared/components/SplashScreen";

/* ------------------------------------------------ */
/* Public shell — hard production guard             */
/* ------------------------------------------------ */
export function GodModePanel() {
  if (!import.meta.env.DEV) return null;
  return <GodModePanelInner />;
}

/* ------------------------------------------------ */
/* Inner panel — only reaches here in DEV           */
/* ------------------------------------------------ */
function GodModePanelInner() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string | null>(null);

  function flash(msg: string) {
    setLog(msg);
    window.setTimeout(() => setLog(null), 2800);
  }

  function handleWipe() {
    localStorage.clear();
    flash("🗑 Local storage wiped. Reloading…");
    window.setTimeout(() => window.location.reload(), 600);
  }

  function handleMockPulse() {
    const { hasActiveChain, clearAll, triggerPulseFlow } = usePulseStore.getState();
    if (hasActiveChain()) {
      clearAll();
      flash("🔴 Active pulse cleared.");
    } else {
      triggerPulseFlow(PulseEvent.SHIFT_SHORTLISTED, "dev-mock-001");
      flash("⚡ Mock pulse fired [SHIFT_SHORTLISTED]. Check nav tabs for the breathing light.");
    }
  }

  function handleToggleRole() {
    const current = roleStorage.get();
    const next = current === "employee" ? "employer" : "employee";
    roleStorage.set(next);
    flash(`🔄 Role switched → ${next}. Page will redirect.`);
  }

  function handleReplayIntro() {
    requestSplashReplay();
    flash("✨ Replaying PRODUCTION LOCK intro (5.0s)…");
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="God Mode Dev Panel"
        title="God Mode Dev Panel"
        style={{
          position: "fixed",
          bottom: 90,
          left: 14,
          zIndex: 999999,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: open ? "#1e293b" : "rgba(30,41,59,0.85)",
          border: "1.5px solid rgba(148,163,184,0.35)",
          color: "#94a3b8",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.40)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "background 0.15s ease, transform 0.15s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        ⚡
      </button>

      {/* Panel sheet */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 140,
            left: 14,
            zIndex: 999998,
            width: 240,
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.15)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "14px 0 10px",
            overflow: "hidden",
          }}
          role="dialog"
          aria-label="God Mode Dev Panel"
        >
          {/* Header */}
          <div
            style={{
              padding: "0 16px 12px",
              borderBottom: "1px solid rgba(148,163,184,0.12)",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#64748b",
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              ⚡ God Mode
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>
              DEV ONLY — hidden in production
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            <PanelButton
              label="Wipe Storage & Reload"
              icon="🗑"
              color="#ef4444"
              onClick={handleWipe}
            />
            <PanelButton
              label="Toggle Mock Pulse"
              icon="💡"
              color="#6366f1"
              onClick={handleMockPulse}
            />
            <PanelButton label="Toggle Role" icon="🔄" color="#0ea5e9" onClick={handleToggleRole} />
            <PanelButton
              label="Replay Cinematic Intro"
              icon="✨"
              color="#0891b2"
              onClick={handleReplayIntro}
            />
          </div>

          {/* Status log */}
          {log && (
            <div
              style={{
                margin: "10px 10px 0",
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(148,163,184,0.08)",
                fontSize: 11,
                color: "#94a3b8",
                lineHeight: 1.4,
                fontWeight: 600,
              }}
            >
              {log}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------ */
/* Reusable panel button                            */
/* ------------------------------------------------ */
type PanelButtonProps = {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
};

function PanelButton({ label, icon, color, onClick }: PanelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 10px",
        borderRadius: 10,
        border: "none",
        background: "rgba(148,163,184,0.06)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${color}18`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#cbd5e1",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </button>
  );
}
