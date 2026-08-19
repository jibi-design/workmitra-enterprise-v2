/** Employee Pro Advanced — Work & Payout Preferences tab. */

import type { EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  onSave: (settings: EmployeeSettings) => void;
};

export function EmployeeSettingsWorkPayoutSection({ settings, onSave }: Props) {
  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle">Work &amp; Payout Preferences</div>

      <div
        style={{
          marginTop: 10,
          padding: "10px 12px",
          borderRadius: "var(--wm-radius-10, 10px)",
          border: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(15,23,42,0.02)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>Instant payout rails</div>
        <div style={{ fontSize: 12, color: "var(--wm-muted, #64748b)", marginTop: 4 }}>
          Bank · {settings.payoutBankLinked ? "Linked" : "Not linked"}
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-muted, #64748b)", marginTop: 2 }}>
          UPI · {settings.payoutUpiLinked ? "Linked" : "Not linked"}
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-muted, #64748b)", marginTop: 6 }}>
          Link status is read from your Work Vault payout profile when available.
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <label className="wm-label" htmlFor="ee-search-radius">
          Work search radius (km)
        </label>
        <input
          id="ee-search-radius"
          className="wm-input"
          type="number"
          min={1}
          max={100}
          value={settings.searchRadiusKm}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onSave({ ...settings, searchRadiusKm: Math.min(100, Math.max(1, Math.round(n))) });
          }}
        />
      </div>

      <div className="wm-field">
        <label className="wm-label" htmlFor="ee-hourly-min">
          Preferred hourly min
        </label>
        <input
          id="ee-hourly-min"
          className="wm-input"
          type="number"
          min={1}
          max={500}
          value={settings.preferredHourlyMin}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onSave({
              ...settings,
              preferredHourlyMin: Math.min(settings.preferredHourlyMax, Math.max(1, Math.round(n))),
            });
          }}
        />
      </div>

      <div className="wm-field">
        <label className="wm-label" htmlFor="ee-hourly-max">
          Preferred hourly max
        </label>
        <input
          id="ee-hourly-max"
          className="wm-input"
          type="number"
          min={1}
          max={500}
          value={settings.preferredHourlyMax}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onSave({
              ...settings,
              preferredHourlyMax: Math.max(settings.preferredHourlyMin, Math.min(500, Math.round(n))),
            });
          }}
        />
      </div>
    </section>
  );
}
