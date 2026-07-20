// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeHomeGetStartedCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\EmployeeHomeGetStartedCard.tsx

type Props = {
  onFindShifts: () => void;
  onCareerSearch: () => void;
};

export function EmployeeHomeGetStartedCard({ onFindShifts, onCareerSearch }: Props) {
  return (
    <section className="wm-ee-card">
      <div style={{ fontWeight: 700, color: "var(--wm-er-text)", fontSize: 16 }}>Get started</div>

      <div className="wm-ee-helperText">
        Find shifts for daily work, or search career jobs for permanent roles.
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button className="wm-primarybtn" type="button" onClick={onFindShifts} style={{ flex: 1 }}>
          Find Shifts
        </button>

        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onCareerSearch}
          style={{ flex: 1 }}
        >
          Career Jobs
        </button>
      </div>
    </section>
  );
}
