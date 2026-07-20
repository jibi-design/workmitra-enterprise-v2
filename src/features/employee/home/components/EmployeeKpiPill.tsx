// App name: Job Mitra
// File name: EmployeeKpiPill.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\EmployeeKpiPill.tsx

import { EMPLOYEE_STATUS_COLORS } from "../helpers/employeeStatusCardStyles";

type EmployeeKpiPillProps = {
  label: string;
  value: number;
};

export function EmployeeKpiPill({ label, value }: EmployeeKpiPillProps) {
  const isZero = value === 0;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: isZero ? EMPLOYEE_STATUS_COLORS.zero : EMPLOYEE_STATUS_COLORS.console,
        background: isZero ? EMPLOYEE_STATUS_COLORS.zeroBg : "rgba(3,105,161,0.08)",
      }}
    >
      {label}: <span style={{ fontWeight: 700 }}>{value}</span>
    </span>
  );
}
