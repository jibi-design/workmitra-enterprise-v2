// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CompanyLeaveYearCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\config\CompanyLeaveYearCard.tsx

import type { CSSProperties } from "react";
import {
  companyConfigStorage,
  MONTH_OPTIONS,
  type CompanyConfig,
} from "../../storage/companyConfig.storage";

const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_COLOR = "#d1d5db";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: "var(--wm-radius-8)",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const sectionTitle: CSSProperties = {
  fontWeight: 900,
  fontSize: 13,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const sectionHint: CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: `1px solid ${BORDER_COLOR}`,
};

function handleFocus(event: React.FocusEvent<HTMLSelectElement>) {
  event.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleBlur(event: React.FocusEvent<HTMLSelectElement>) {
  event.currentTarget.style.borderColor = BORDER_COLOR;
}

type Props = {
  config: CompanyConfig;
};

export function CompanyLeaveYearCard({ config }: Props) {
  const handleChange = (month: number) => {
    companyConfigStorage.setLeaveYearStart(month);
  };

  return (
    <div>
      <div style={sectionTitle}>Leave Year Start</div>

      <div style={sectionHint}>
        When does your company&rsquo;s leave year begin? Most companies start in January, but some
        use April or other months. This helps calculate leave balances correctly for your employees.
      </div>

      <select
        value={config.leaveYearStartMonth}
        onChange={(event) => handleChange(Number(event.target.value))}
        style={{ ...inputStyle, cursor: "pointer" }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {MONTH_OPTIONS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
}
