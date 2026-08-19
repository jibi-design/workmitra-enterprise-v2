/** Shared Settings danger zone — in-app account deletion entry (Play / App Store). */

import { JobMitraBrandName } from "../components/brand/BrandName";

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const WEB_DELETION_URL = "https://jibi-design.github.io/workmitra-privacy/#account-deletion";

type Props = {
  onDeleteAccount: () => void;
  /** Optional footer line under the zone (e.g. app version). */
  showVersionFooter?: boolean;
};

export function DangerZoneSection({ onDeleteAccount, showVersionFooter = true }: Props) {
  return (
    <>
      <div className="wm-settingsGroup wm-settingsGroup--danger" data-testid="settings-danger-zone">
        <div className="wm-settingsGroup__title">Danger zone</div>
        <div style={sectionHeadStyle}>
          <div
            style={{
              ...sectionIconStyle,
              border: "1px solid rgba(220, 38, 38, 0.18)",
              color: "var(--wm-error)",
            }}
          >
            <IconDanger />
          </div>
          <h2 style={{ ...sectionTitleStyle, color: "var(--wm-error)" }}>Account deletion</h2>
        </div>

        <button
          type="button"
          className="wm-settingsRow wm-settingsRow--danger"
          data-testid="settings-delete-account"
          onClick={onDeleteAccount}
        >
          <span className="wm-settingsRow__icon" style={{ color: "#b91c1c" }}>
            <IconDelete />
          </span>
          <span className="wm-settingsRow__label">Delete Account</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>

        <div style={dangerHintStyle}>
          Delete Account permanently removes your profile, history, and settings. This cannot be
          undone. You must confirm with your password and by typing DELETE.
        </div>

        <div style={webLinkStyle}>
          Web request (Play Store):{" "}
          <a href={WEB_DELETION_URL} target="_blank" rel="noopener noreferrer">
            Account deletion
          </a>
          {" · "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`}>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
      {showVersionFooter ? (
        <div className="wm-settingsVersion">
          <JobMitraBrandName size="sm" /> · Account controls
        </div>
      ) : null}
    </>
  );
}

function IconDanger() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
      />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"
      />
    </svg>
  );
}

const sectionHeadStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
};

const sectionIconStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(220, 38, 38, 0.06)",
  flexShrink: 0,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 800,
};

const dangerHintStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 11,
  color: "var(--wm-er-muted, var(--wm-muted, #64748b))",
  fontWeight: 500,
  lineHeight: 1.5,
};

const webLinkStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 11,
  color: "var(--wm-er-muted, var(--wm-muted, #64748b))",
  lineHeight: 1.5,
};
