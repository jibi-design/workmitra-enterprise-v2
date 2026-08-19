/** Employee Pro Advanced — Notification Controls (shift + escrow). */

import type { EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
};

export function EmployeeSettingsNotificationControlsSection({ settings, onToggle }: Props) {
  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle">Notification Controls</div>

      <div className="wm-toggleRow" style={{ marginTop: 10 }}>
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.pushEnabled}
            onChange={() => onToggle("pushEnabled")}
          />
          <span>Push notifications</span>
        </label>
      </div>

      <div className="wm-toggleRow">
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.shiftAlerts}
            onChange={() => onToggle("shiftAlerts")}
          />
          <span>Real-time shift alerts</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 8 }}>
        Invite, confirm, and start-time reminders for Shift Jobs.
      </div>

      <div className="wm-toggleRow">
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.escrowCreditAlerts}
            onChange={() => onToggle("escrowCreditAlerts")}
          />
          <span>Escrow credit notifications</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2 }}>
        Notify when escrow is funded, held, or released to your payout rail.
      </div>
    </section>
  );
}
