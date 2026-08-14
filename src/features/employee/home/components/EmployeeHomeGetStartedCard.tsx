// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeHomeGetStartedCard.tsx

import { DOMAIN_BY_KEY } from "../../../../shared/config/domainRegistry";

type Props = {
  onFindShifts: () => void;
  onCareerSearch: () => void;
};

export function EmployeeHomeGetStartedCard({ onFindShifts, onCareerSearch }: Props) {
  const career = DOMAIN_BY_KEY.career;

  return (
    <section className="wm-ee-card">
      <div style={{ fontWeight: 700, color: "var(--wm-er-text)", fontSize: 16 }}>Get started</div>

      <div className="wm-ee-helperText">
        Find shifts for daily work, or search {career.title.toLowerCase()} for permanent roles.
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
          {career.title}
        </button>
      </div>
    </section>
  );
}
