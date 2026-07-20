// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsHelpLegalSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsHelpLegalSection.tsx

export function EmployeeSettingsHelpLegalSection() {
  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <div className="wm-ee-cardTitle">Help & legal</div>

      <div className="wm-linkList" style={{ marginTop: 8 }}>
        <button
          className="wm-ee-linkBtn"
          type="button"
          onClick={() => {
            window.location.hash = "#/employee/help";
          }}
        >
          Help & Support
        </button>

        <button
          className="wm-ee-linkBtn"
          type="button"
          onClick={() => window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")}
        >
          Privacy Policy
        </button>
      </div>
    </section>
  );
}
