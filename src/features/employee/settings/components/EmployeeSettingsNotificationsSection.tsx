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
      <div className={`wm-settingsPulseRow${pulseEnabled ? " wm-settingsPulseRow--on" : ""}`}>
        <div style={{ flex: 1 }}>
          <div className="wm-settingsPulseRow__title">Pulse Navigation</div>
          <div className="wm-settingsPulseRow__sub">
            Glowing LED indicators that guide you step-by-step through workflows.
            {!pulseEnabled ? (
              <span className="wm-settingsPulseRow__warn">
                Navigation lights are OFF — no pulses will fire.
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className={`wm-press-btn wm-settingsToggle${pulseEnabled ? " wm-settingsToggle--on" : ""}${popKey === "pulseNav" ? " wm-popSaved" : ""}`}
          onClick={handlePulseToggle}
          onAnimationEnd={clearPop}
          aria-label={pulseEnabled ? "Disable pulse navigation" : "Enable pulse navigation"}
        >
          <span className="wm-settingsToggle__thumb" />
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
