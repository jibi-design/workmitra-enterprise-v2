// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsPreferencesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsPreferencesSection.tsx

import { useState } from "react";
import type { EmployeeSettings } from "../storage/employeeSettings.storage";

function isLanguage(value: string): value is EmployeeSettings["language"] {
  return value === "en";
}

function isHomeTab(value: string): value is EmployeeSettings["defaultHomeTab"] {
  return value === "home" || value === "jobs" || value === "alerts";
}

type Props = {
  settings: EmployeeSettings;
  onSave: (settings: EmployeeSettings) => void;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
};

export function EmployeeSettingsPreferencesSection({ settings, onSave, onToggle }: Props) {
  const [popKey, setPopKey] = useState<string | null>(null);

  function clearPop() {
    setPopKey(null);
  }

  function handleToggle<K extends keyof EmployeeSettings>(key: K) {
    onToggle(key);
    setPopKey(String(key));
  }

  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <div className="wm-ee-cardTitle">Preferences</div>

      <div className="wm-field" style={{ marginTop: 8 }}>
        <label className="wm-label">Language</label>
        <select
          className="wm-input"
          value="en"
          onChange={(event) => {
            const value = event.target.value;
            if (!isLanguage(value)) return;
            onSave({ ...settings, language: value });
          }}
          aria-disabled="true"
          disabled
          title="English only (locked)"
        >
          <option value="en">English (locked)</option>
        </select>
        <div className="wm-ee-helperText">English-only is locked for global publishing.</div>
      </div>

      <div className="wm-field">
        <label className="wm-label">Theme</label>
        <input className="wm-input" value="Light (locked)" disabled aria-disabled="true" />
        <div className="wm-ee-helperText">Theme is locked to Light for now (Phase-0).</div>
      </div>

      <div
        className={`wm-toggleRow${popKey === "quickApplyEnabled" ? " wm-popSaved" : ""}`}
        style={{ marginTop: 10 }}
        onAnimationEnd={clearPop}
      >
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.quickApplyEnabled}
            onChange={() => handleToggle("quickApplyEnabled")}
          />
          <span>Quick Apply</span>
        </label>
      </div>

      <div className="wm-ee-helperText" style={{ marginTop: 4 }}>
        Apply to shifts with one tap using your saved profile. Complete your profile first to use
        this feature.
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">Default home tab</label>
        <select
          className={`wm-input${popKey === "defaultHomeTab" ? " wm-popSaved" : ""}`}
          value={settings.defaultHomeTab}
          onChange={(event) => {
            const value = event.target.value;
            if (!isHomeTab(value)) return;
            onSave({ ...settings, defaultHomeTab: value });
            setPopKey("defaultHomeTab");
          }}
          onAnimationEnd={clearPop}
        >
          <option value="home">Home</option>
          <option value="jobs">My Jobs</option>
          <option value="alerts">Alerts</option>
        </select>
      </div>
    </section>
  );
}
