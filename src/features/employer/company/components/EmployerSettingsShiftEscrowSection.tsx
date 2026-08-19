/** Shift / Escrow preference defaults for single-employer Pro settings. */

import type { EmployerProfile } from "../storage/employerSettings.storage";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  toggleTrackStyle,
  toggleThumbStyle,
} from "../helpers/settingsStyles";

type Props = {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
};

export function EmployerSettingsShiftEscrowSection({ data, editMode, onFieldChange }: Props) {
  const favoritesFirst = Boolean(data.shiftFavoritesFirstDefault);
  const escrowHold = data.escrowHoldDefaultEnabled !== false;

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V8h14v11Z"
            />
          </svg>
        </div>
        <h2 style={sectionTitleStyle}>Shift &amp; Escrow Defaults</h2>
      </div>

      <ToggleRow
        label="Favourites-first shift invites"
        description="Prefer saved workers when creating new shifts."
        checked={favoritesFirst}
        disabled={!editMode}
        onToggle={() => onFieldChange("shiftFavoritesFirstDefault", !favoritesFirst)}
      />

      <ToggleRow
        label="Escrow hold by default"
        description="Hold payout in escrow until shift confirmation completes."
        checked={escrowHold}
        disabled={!editMode}
        onToggle={() => onFieldChange("escrowHoldDefaultEnabled", !escrowHold)}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
        padding: "10px 12px",
        borderRadius: "var(--wm-radius-10)",
        border: "1px solid var(--wm-er-divider)",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3, lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        style={toggleTrackStyle(checked)}
      >
        <span style={toggleThumbStyle(checked)} />
      </button>
    </div>
  );
}
