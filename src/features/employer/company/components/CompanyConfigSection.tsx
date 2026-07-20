// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CompanyConfigSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\CompanyConfigSection.tsx

import { useEffect, useState } from "react";
import { companyConfigStorage, type CompanyConfig } from "../storage/companyConfig.storage";
import { CompanyHolidaysCard } from "./config/CompanyHolidaysCard";
import { CompanyLeaveYearCard } from "./config/CompanyLeaveYearCard";
import { CompanyShiftTimingsCard } from "./config/CompanyShiftTimingsCard";
import { CompanyWorkingDaysCard } from "./config/CompanyWorkingDaysCard";

const BORDER_COLOR = "#d1d5db";

function useCompanyConfig(): CompanyConfig {
  const [config, setConfig] = useState<CompanyConfig>(() => companyConfigStorage.get());

  useEffect(() => {
    const refresh = () => setConfig(companyConfigStorage.get());

    refresh();

    return companyConfigStorage.subscribe(refresh);
  }, []);

  return config;
}

export function CompanyConfigSection() {
  const config = useCompanyConfig();

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${BORDER_COLOR}`,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Company Settings
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
          Set up your company&rsquo;s work schedule once. Job Mitra will use these settings to
          automatically mark weekends and holidays as &ldquo;Off&rdquo; in attendance, pre-fill
          shift timings, and calculate leave correctly for all your employees.
        </div>
      </div>

      <CompanyWorkingDaysCard config={config} />
      <CompanyShiftTimingsCard config={config} />
      <CompanyHolidaysCard config={config} />
      <CompanyLeaveYearCard config={config} />
    </div>
  );
}
