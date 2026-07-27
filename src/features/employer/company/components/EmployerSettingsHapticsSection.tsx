// src/features/employer/company/components/EmployerSettingsHapticsSection.tsx
// Sound & Haptics section for the Employer settings dashboard.

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

export function EmployerSettingsHapticsSection({ data, editMode, onFieldChange }: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div
          style={{
            ...sectionIconStyle,
            border: "1px solid rgba(99,102,241,0.18)",
            color: "#6366f1",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9A9 9 0 0 1 3 12a9 9 0 0 1 9-9Zm0 2a7 7 0 1 0 0 14A7 7 0 0 0 12 5Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 12 7Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
            />
          </svg>
        </div>
        <h2 style={sectionTitleStyle}>Sound &amp; Haptics</h2>
      </div>

      {/* Haptic Feedback */}
      <div style={toggleRowStyle}>
        <div>
          <div style={rowLabelStyle}>Haptic feedback</div>
          <div style={rowDescStyle}>Subtle vibrations on taps and confirmations.</div>
        </div>
        <button
          type="button"
          disabled={!editMode}
          onClick={() => onFieldChange("hapticFeedback", !data.hapticFeedback)}
          style={toggleTrackStyle(data.hapticFeedback)}
          aria-label={data.hapticFeedback ? "Disable haptic feedback" : "Enable haptic feedback"}
        >
          <div style={toggleThumbStyle(data.hapticFeedback)} />
        </button>
      </div>

      {/* Alert Sound — Coming Soon */}
      <div style={{ marginBottom: 14 }}>
        <div style={rowLabelStyle}>Alert sound</div>
        <div
          style={{
            marginTop: 6,
            padding: "8px 12px",
            borderRadius: "var(--wm-radius-8)",
            border: "1.5px solid #d1d5db",
            background: "var(--wm-er-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Default</span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--wm-radius-8)",
              fontSize: 11,
              fontWeight: 800,
              background: "rgba(100,116,139,0.08)",
              color: "#64748b",
            }}
          >
            Coming Soon
          </span>
        </div>
        <div style={rowDescStyle}>Custom alert sounds ship in Phase 1.</div>
      </div>

      {/* In-App Volume — Coming Soon */}
      <div style={{ marginBottom: 0 }}>
        <div style={rowLabelStyle}>In-app sound volume</div>
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
            marginTop: 8,
            accentColor: "#6366f1",
            opacity: 0.4,
            cursor: "not-allowed",
          }}
        />
        <div style={rowDescStyle}>Volume control ships in Phase 1.</div>
      </div>
    </div>
  );
}

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
