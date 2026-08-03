/** Employer settings — Help & Legal links. */

export function EmployerSettingsHelpLegalSection() {
  return (
    <section className="wm-settingsGroup">
      <div className="wm-settingsGroup__title">Help &amp; Legal</div>
      <button
        type="button"
        className="wm-settingsRow"
        onClick={() => {
          window.location.hash = "#/employer/help";
        }}
      >
        <span className="wm-settingsRow__label" style={{ color: "var(--wm-brand-700, #1d4ed8)" }}>
          Help &amp; Support
        </span>
        <span className="wm-settingsRow__chevron" aria-hidden="true">
          ›
        </span>
      </button>
      <button
        type="button"
        className="wm-settingsRow"
        onClick={() => window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")}
      >
        <span className="wm-settingsRow__label">Privacy Policy</span>
        <span className="wm-settingsRow__chevron" aria-hidden="true">
          ›
        </span>
      </button>
    </section>
  );
}
