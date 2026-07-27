// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsAboutSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\settings\components\EmployeeSettingsAboutSection.tsx

export function EmployeeSettingsAboutSection() {
  return (
    <>
      <section className="wm-settingsGroup">
        <div className="wm-settingsGroup__title">Support</div>
        <div className="wm-kv" style={{ padding: "8px 10px" }}>
          <div className="k">App version</div>
          <div className="v">1.0.0</div>
        </div>
        <div className="wm-kv" style={{ padding: "0 10px 8px" }}>
          <div className="k">Build</div>
          <div className="v">Beta</div>
        </div>
      </section>
      <div className="wm-settingsVersion">WorkMitra v1.0 · Beta</div>
    </>
  );
}
