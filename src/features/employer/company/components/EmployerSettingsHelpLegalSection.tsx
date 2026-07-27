/** Employer settings — Help & Legal links. */

export function EmployerSettingsHelpLegalSection() {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
        Help &amp; Legal
      </div>
      <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
        <button
          type="button"
          className="wm-settingsLinkBtn"
          onClick={() => {
            window.location.hash = "#/employer/help";
          }}
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            textAlign: "left",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--wm-er-accent-hr)",
            cursor: "pointer",
          }}
        >
          Help &amp; Support →
        </button>
        <button
          type="button"
          className="wm-settingsLinkBtn"
          onClick={() => window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")}
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            textAlign: "left",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--wm-er-muted)",
            cursor: "pointer",
          }}
        >
          Privacy Policy →
        </button>
      </div>
    </div>
  );
}
