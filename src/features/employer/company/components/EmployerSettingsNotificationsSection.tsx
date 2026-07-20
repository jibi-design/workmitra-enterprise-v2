// src/features/employer/company/components/EmployerSettingsNotificationsSection.tsx
// Notifications & Navigation section for the Employer settings dashboard.
// Phase 3: Pulse Navigation toggle + Notifications + Quiet Hours + Global Mute.

import { usePulseNavStore } from "../../../pulse/pulseNavStore";
import { usePulseStore } from "../../../pulse/pulseStore";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  toggleTrackStyle,
  toggleThumbStyle,
} from "../helpers/settingsStyles";

interface Props {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
}

export function EmployerSettingsNotificationsSection({ data, editMode, onFieldChange }: Props) {
  const pulseEnabled = usePulseNavStore((s) => s.enabled);
  const setPulseEnabled = usePulseNavStore((s) => s.setEnabled);
  const clearAllPulses = usePulseStore((s) => s.clearAll);

  function handlePulseToggle() {
    const next = !pulseEnabled;
    setPulseEnabled(next);
    if (!next) {
      clearAllPulses();
    }
  }

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div
          style={{
            ...sectionIconStyle,
            border: "1px solid rgba(139,92,246,0.18)",
            color: "#7c3aed",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"
            />
          </svg>
        </div>
        <h2 style={sectionTitleStyle}>Notifications &amp; Navigation</h2>
      </div>

      {/* Pulse Navigation toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
          padding: "10px 12px",
          borderRadius: 10,
          background: pulseEnabled ? "rgba(139,92,246,0.05)" : "rgba(100,116,139,0.04)",
          border: pulseEnabled
            ? "1px solid rgba(139,92,246,0.16)"
            : "1px solid var(--wm-er-divider)",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Pulse Navigation
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3, lineHeight: 1.4 }}>
            Glowing LED indicators that guide you through workflows step-by-step.
          </div>
          {!pulseEnabled && (
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--wm-error)",
              }}
            >
              Navigation lights are OFF — no pulses will fire.
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handlePulseToggle}
          style={{
            ...toggleTrackStyle(pulseEnabled),
            background: pulseEnabled ? "#7c3aed" : undefined,
            marginLeft: 12,
          }}
          aria-label={pulseEnabled ? "Disable pulse navigation" : "Enable pulse navigation"}
        >
          <div style={toggleThumbStyle(pulseEnabled)} />
        </button>
      </div>

      {/* Notifications toggle */}
      <div style={toggleRowStyle}>
        <div>
          <div style={rowLabelStyle}>Notifications</div>
          <div style={rowDescStyle}>Receive alerts for applications and updates.</div>
        </div>
        <button
          type="button"
          disabled={!editMode}
          onClick={() => onFieldChange("notificationsEnabled", !data.notificationsEnabled)}
          style={toggleTrackStyle(data.notificationsEnabled)}
          aria-label={data.notificationsEnabled ? "Disable notifications" : "Enable notifications"}
        >
          <div style={toggleThumbStyle(data.notificationsEnabled)} />
        </button>
      </div>

      {/* Global Mute */}
      <div style={toggleRowStyle}>
        <div>
          <div style={rowLabelStyle}>Global mute</div>
          <div style={rowDescStyle}>Silences all in-app notification sounds.</div>
        </div>
        <button
          type="button"
          disabled={!editMode}
          onClick={() => onFieldChange("globalMute", !data.globalMute)}
          style={toggleTrackStyle(data.globalMute)}
          aria-label={data.globalMute ? "Unmute sounds" : "Mute all sounds"}
        >
          <div style={toggleThumbStyle(data.globalMute)} />
        </button>
      </div>

      {/* Quiet Hours */}
      <div style={{ marginTop: 4 }}>
        <div style={{ ...toggleRowStyle, marginBottom: 8 }}>
          <div>
            <div style={rowLabelStyle}>Quiet hours (Do Not Disturb)</div>
            <div style={rowDescStyle}>No notifications during the selected window.</div>
          </div>
          <button
            type="button"
            disabled={!editMode}
            onClick={() => onFieldChange("quietHoursEnabled", !data.quietHoursEnabled)}
            style={toggleTrackStyle(data.quietHoursEnabled)}
            aria-label={data.quietHoursEnabled ? "Disable quiet hours" : "Enable quiet hours"}
          >
            <div style={toggleThumbStyle(data.quietHoursEnabled)} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={timeLabel}>From</div>
            <input
              type="time"
              value={data.quietFrom}
              onChange={(e) => onFieldChange("quietFrom", e.target.value)}
              disabled={!editMode || !data.quietHoursEnabled}
              style={{
                width: "100%",
                height: 38,
                borderRadius: 8,
                border: "1.5px solid #d1d5db",
                background: "var(--wm-er-card)",
                padding: "0 10px",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                opacity: !editMode || !data.quietHoursEnabled ? 0.5 : 1,
              }}
            />
          </div>
          <div>
            <div style={timeLabel}>To</div>
            <input
              type="time"
              value={data.quietTo}
              onChange={(e) => onFieldChange("quietTo", e.target.value)}
              disabled={!editMode || !data.quietHoursEnabled}
              style={{
                width: "100%",
                height: 38,
                borderRadius: 8,
                border: "1.5px solid #d1d5db",
                background: "var(--wm-er-card)",
                padding: "0 10px",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                opacity: !editMode || !data.quietHoursEnabled ? 0.5 : 1,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Local layout styles                              */
/* ------------------------------------------------ */
const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const rowLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-er-text)",
};

const rowDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

const timeLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--wm-er-muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
