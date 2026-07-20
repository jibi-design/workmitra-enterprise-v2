// App name: Job Mitra
// File name: ShiftSearchHero.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchHero.tsx

export function ShiftSearchHero() {
  return (
    <section className="wm-shiftEmployeeSearchHero">
      <div className="wm-shiftEmployeeHeroTop">
        <div className="wm-shiftEmployeeHeroIdentity">
          <div className="wm-shiftEmployeeHeroIcon">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
              />
            </svg>
          </div>

          <div>
            <div className="wm-pageTitle">Find Shifts</div>
            <div className="wm-pageSub">
              Find daily, helper, fresher-friendly and experienced shifts.
            </div>
          </div>
        </div>

        <div className="wm-shiftEmployeeHeroBadge">Live search</div>
      </div>

      <div className="wm-shiftEmployeeHeroText">
        Search by work type, company, location, date, or experience level. Complete your city and
        skills to improve matching.
      </div>
    </section>
  );
}
