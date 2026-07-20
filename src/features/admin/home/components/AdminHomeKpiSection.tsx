// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeKpiSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeKpiSection.tsx

import type { AdminHomeData } from "./AdminHomeSharedUi";
import { Kpi, Sec } from "./AdminHomeSharedUi";

type Props = {
  data: AdminHomeData;
};

export function AdminHomeKpiSection({ data }: Props) {
  const totalHired = data.shiftConfirmed + data.careerHired;
  const totalPosts = data.shiftTotal + data.careerTotal;
  const totalApps =
    data.shiftAppsApplied +
    data.shiftShortlisted +
    data.shiftConfirmed +
    data.shiftRejected +
    data.careerAppsApplied +
    data.careerShortlisted +
    data.careerInterview +
    data.careerOffered +
    data.careerHired +
    data.careerRejected;

  return (
    <>
      <Sec label="Platform Metrics" />

      <div className="wm-ad-kpiCard">
        <div className="wm-ad-kpiGrid">
          <Kpi label="Employers" value={data.employers} color="#7c3aed" />
          <Kpi label="Employees" value={data.employees} color="#0891b2" />
          <Kpi label="Total Posts" value={totalPosts} color="var(--wm-ad-navy)" />
          <Kpi label="Applications" value={totalApps} color="var(--wm-ad-navy-600)" />
          <Kpi label="Hired" value={totalHired} color="var(--wm-ad-green)" />
          <Kpi label="Audit Events" value={data.totalEvents} color="var(--wm-ad-navy-500)" />
        </div>
      </div>
    </>
  );
}
