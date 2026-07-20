// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceTimesheetHeader.tsx

import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  year: number;
  month: number;
  monthNames: string[];
  isCurrentMonth: boolean;
  onBack: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const monthNavStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--wm-er-border)",
  borderRadius: 8,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 800,
  color: AMBER,
};

export function EmployeeWorkforceTimesheetHeader({
  year,
  month,
  monthNames,
  isCurrentMonth,
  onBack,
  onPrevMonth,
  onNextMonth,
}: Props) {
  return (
    <>
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: AMBER,
            padding: 4,
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <IconBack />
        </button>

        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">My Timesheet</div>
          <div className="wm-pageSub">Monthly attendance summary</div>
        </div>
      </div>

      <div style={{ ...monthNavStyle, marginTop: 14 }}>
        <button type="button" onClick={onPrevMonth} style={navBtnStyle}>
          ◀
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
            {monthNames[month]} {year}
          </div>

          {isCurrentMonth && (
            <div style={{ fontSize: 10, color: AMBER, fontWeight: 700, marginTop: 2 }}>
              Current Month
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          style={{
            ...navBtnStyle,
            opacity: isCurrentMonth ? 0.3 : 1,
            cursor: isCurrentMonth ? "default" : "pointer",
          }}
        >
          ▶
        </button>
      </div>
    </>
  );
}
