/** Employee Pro Advanced — Privacy & Compliance tab. */

import type { DocumentVisibility, EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  onSave: (settings: EmployeeSettings) => void;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
};

function isVisibility(value: string): value is DocumentVisibility {
  return value === "private" || value === "employers_on_hire" || value === "verified_employers";
}

export function EmployeeSettingsPrivacySection({ settings, onSave, onToggle }: Props) {
  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle">Privacy &amp; Compliance</div>

      <div className="wm-toggleRow" style={{ marginTop: 10 }}>
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.openToWork}
            onChange={() => onToggle("openToWork")}
          />
          <span>Open to Work (profile searchable)</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 12 }}>
        When on, verified employers can discover your profile in shift matching.
      </div>

      <div className="wm-field">
        <label className="wm-label" htmlFor="ee-doc-visibility">
          Document visibility
        </label>
        <select
          id="ee-doc-visibility"
          className="wm-input"
          value={settings.documentVisibility}
          onChange={(e) => {
            const value = e.target.value;
            if (!isVisibility(value)) return;
            onSave({ ...settings, documentVisibility: value });
          }}
        >
          <option value="private">Private (vault only)</option>
          <option value="employers_on_hire">Share with employers on hire</option>
          <option value="verified_employers">Verified employers only</option>
        </select>
        <div className="wm-ee-helperText">
          Controls who can request RTW / ID documents from your Work Vault.
        </div>
      </div>
    </section>
  );
}
