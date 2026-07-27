// src/features/employee/settings/components/EmployeeSettingsHapticsSection.tsx
// Sound & Haptics settings section for the Employee domain.

import { useState } from "react";
import type { EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
};

export function EmployeeSettingsHapticsSection({ settings, onToggle }: Props) {
  const [popKey, setPopKey] = useState<string | null>(null);

  function clearPop() {
    setPopKey(null);
  }

  function handleToggle<K extends keyof EmployeeSettings>(key: K) {
    onToggle(key);
    setPopKey(String(key));
  }

  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "var(--wm-indigo-500)", flexShrink: 0 }}
        >
          <path
            d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9A9 9 0 0 1 3 12a9 9 0 0 1 9-9Zm0 2a7 7 0 1 0 0 14A7 7 0 0 0 12 5Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 12 7Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
            fill="currentColor"
          />
        </svg>
        Sound &amp; Haptics
      </div>

      {/* Haptic Feedback */}
      <div
        className={`wm-toggleRow${popKey === "hapticFeedback" ? " wm-popSaved" : ""}`}
        style={{ marginTop: 8 }}
        onAnimationEnd={clearPop}
      >
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.hapticFeedback}
            onChange={() => handleToggle("hapticFeedback")}
          />
          <span>Haptic feedback</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 10 }}>
        Subtle vibrations on button taps and confirmations.
      </div>

      {/* Global Mute */}
      <div
        className={`wm-toggleRow${popKey === "globalMute" ? " wm-popSaved" : ""}`}
        onAnimationEnd={clearPop}
      >
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.globalMute}
            onChange={() => handleToggle("globalMute")}
          />
          <span>Global mute (silence all in-app sounds)</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 10 }}>
        Silences all in-app notification tones and alert sounds.
      </div>

      {/* Alert Sound picker — Coming Soon */}
      <div className="wm-field" style={{ marginTop: 4 }}>
        <label className="wm-label">Alert sound</label>
        <select className="wm-input" value="default" disabled aria-disabled="true">
          <option value="default">Default (Phase 1)</option>
        </select>
        <div className="wm-ee-helperText">Custom alert sounds ship in Phase 1.</div>
      </div>

      {/* In-App Sound volume — Coming Soon */}
      <div className="wm-field" style={{ marginTop: 8 }}>
        <label className="wm-label">In-app sound volume</label>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          defaultValue={80}
          disabled
          aria-disabled="true"
          style={{
            width: "100%",
            accentColor: "var(--wm-indigo-500)",
            opacity: 0.45,
            cursor: "not-allowed",
          }}
        />
        <div className="wm-ee-helperText">Volume control ships in Phase 1.</div>
      </div>
    </section>
  );
}
