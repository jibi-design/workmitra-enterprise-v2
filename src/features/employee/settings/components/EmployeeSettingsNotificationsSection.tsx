// src/features/employee/settings/components/EmployeeSettingsNotificationsSection.tsx
// Notifications & Navigation section for the Employee settings dashboard.
// Phase 3: added Pulse Navigation toggle (reads/writes usePulseNavStore) + Global Mute.

import { useState } from "react";
import { usePulseNavStore } from "../../../pulse/pulseNavStore";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  /** Quiet-hours time fields — debounced persist (P1-1). */
  onSaveDebounced: (settings: EmployeeSettings) => void;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
};

export function EmployeeSettingsNotificationsSection({
  settings,
  onSaveDebounced,
  onToggle,
}: Props) {
  const pulseEnabled = usePulseNavStore((s) => s.enabled);
  const setPulseEnabled = usePulseNavStore((s) => s.setEnabled);
  const clearAllPulses = usePulseStore((s) => s.clearAll);
  const [popKey, setPopKey] = useState<string | null>(null);

  function triggerPop(key: string) {
    setPopKey(key);
  }

  function clearPop() {
    setPopKey(null);
  }

  function handleSettingsToggle<K extends keyof EmployeeSettings>(key: K) {
    onToggle(key);
    triggerPop(String(key));
  }

  function handlePulseToggle() {
    const next = !pulseEnabled;
    setPulseEnabled(next);
    if (!next) {
      clearAllPulses();
    }
    triggerPop("pulseNav");
  }

  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "var(--wm-amber-400)", flexShrink: 0 }}
        >
          <path
            fill="currentColor"
            d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"
          />
        </svg>
        Notifications &amp; Navigation
      </div>

      {/* Pulse Navigation toggle — CRITICAL: blocks at pulseStore level */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginTop: 8,
          marginBottom: 4,
          padding: "10px 12px",
          borderRadius: "var(--wm-radius-10)",
          background: pulseEnabled ? "rgba(99,102,241,0.05)" : "rgba(100,116,139,0.04)",
          border: pulseEnabled ? "1px solid rgba(99,102,241,0.16)" : "1px solid rgba(0,0,0,0.07)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-text, #1e293b)" }}>
            Pulse Navigation
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--wm-muted, #64748b)",
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            Glowing LED indicators that guide you step-by-step through workflows.
            {!pulseEnabled && (
              <span
                style={{
                  display: "block",
                  marginTop: 3,
                  color: "var(--wm-error)",
                  fontWeight: 600,
                }}
              >
                Navigation lights are OFF — no pulses will fire.
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className={`wm-press-btn${popKey === "pulseNav" ? " wm-popSaved" : ""}`}
          onClick={handlePulseToggle}
          onAnimationEnd={clearPop}
          style={toggleTrackStyle(pulseEnabled)}
          aria-label={pulseEnabled ? "Disable pulse navigation" : "Enable pulse navigation"}
        >
          <div style={toggleThumbStyle(pulseEnabled)} />
        </button>
      </div>

      {/* Push Notifications */}
      <div
        className={`wm-toggleRow${popKey === "pushEnabled" ? " wm-popSaved" : ""}`}
        style={{ marginTop: 12 }}
        onAnimationEnd={clearPop}
      >
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.pushEnabled}
            onChange={() => handleSettingsToggle("pushEnabled")}
          />
          <span>Push notifications</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 10 }}>
        Domain toggles — shift and career counts never mix.
      </div>

      {/* Domain alert toggles */}
      <div
        className={`wm-toggleRow${popKey === "shiftAlerts" || popKey === "careerAlerts" || popKey === "workforceAlerts" ? " wm-popSaved" : ""}`}
        onAnimationEnd={clearPop}
      >
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.shiftAlerts}
            onChange={() => handleSettingsToggle("shiftAlerts")}
          />
          <span>Shift alerts</span>
        </label>
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.careerAlerts}
            onChange={() => handleSettingsToggle("careerAlerts")}
          />
          <span>Career alerts</span>
        </label>
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.workforceAlerts}
            onChange={() => handleSettingsToggle("workforceAlerts")}
          />
          <span>Work alerts</span>
        </label>
      </div>

      {/* Quiet Hours */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <label className="wm-label">Quiet hours (Do Not Disturb)</label>
        <label
          className={`wm-toggle${popKey === "quietHoursEnabled" ? " wm-popSaved" : ""}`}
          style={{ marginTop: 6 }}
          onAnimationEnd={clearPop}
        >
          <input
            type="checkbox"
            checked={settings.quietHoursEnabled}
            onChange={() => handleSettingsToggle("quietHoursEnabled")}
          />
          <span>Enable quiet hours</span>
        </label>

        <div className="wm-grid2" style={{ marginTop: 10 }}>
          <div>
            <label className="wm-label">From</label>
            <input
              className={`wm-input${popKey === "quietFrom" ? " wm-popSaved" : ""}`}
              type="time"
              value={settings.quietFrom}
              onChange={(e) => {
                onSaveDebounced({ ...settings, quietFrom: e.target.value });
                triggerPop("quietFrom");
              }}
              onAnimationEnd={clearPop}
              disabled={!settings.quietHoursEnabled}
              aria-disabled={!settings.quietHoursEnabled}
            />
          </div>
          <div>
            <label className="wm-label">To</label>
            <input
              className={`wm-input${popKey === "quietTo" ? " wm-popSaved" : ""}`}
              type="time"
              value={settings.quietTo}
              onChange={(e) => {
                onSaveDebounced({ ...settings, quietTo: e.target.value });
                triggerPop("quietTo");
              }}
              onAnimationEnd={clearPop}
              disabled={!settings.quietHoursEnabled}
              aria-disabled={!settings.quietHoursEnabled}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Inline toggle styles (matches employer pattern)   */
/* ------------------------------------------------ */
function toggleTrackStyle(enabled: boolean): React.CSSProperties {
  return {
    width: 44,
    height: 24,
    borderRadius: "var(--wm-radius-pill)",
    border: "1px solid rgba(0,0,0,0.12)",
    background: enabled ? "var(--wm-indigo-500)" : "rgba(0,0,0,0.10)",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s ease",
    flexShrink: 0,
    marginLeft: 12,
  };
}

function toggleThumbStyle(enabled: boolean): React.CSSProperties {
  return {
    width: 18,
    height: 18,
    borderRadius: "var(--wm-radius-pill)",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
    position: "absolute",
    top: 2,
    left: enabled ? 22 : 3,
    transition: "left 0.2s ease",
  };
}
