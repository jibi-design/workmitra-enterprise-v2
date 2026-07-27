// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsHelpLegalSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsHelpLegalSection.tsx

export function EmployeeSettingsHelpLegalSection() {
  return (
    <section className="wm-settingsGroup">
      <div className="wm-ee-cardTitle">Help & legal</div>

      <div className="wm-linkList" style={{ marginTop: 8 }}>
        <button
          className="wm-settingsRow"
          type="button"
          onClick={() => {
            window.location.hash = "#/employee/help";
          }}
        >
          <span className="wm-settingsRow__label">Help & Support</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>

        <button
          className="wm-settingsRow"
          type="button"
          onClick={() => window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")}
        >
          <span className="wm-settingsRow__label">Privacy Policy</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>
      </div>
    </section>
  );
}
