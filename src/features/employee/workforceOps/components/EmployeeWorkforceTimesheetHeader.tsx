// App name: Job Mitra | EmployeeWorkforceTimesheetHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
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
  borderRadius: "var(--wm-radius-8)",
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
      <DomainHero
        variant="workforce"
        audience="employee"
        icon={
          <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
            <IconBack />
          </button>
        }
        title="My Timesheet"
        subtitle="Monthly attendance summary"
        description="Review attendance by month and track workforce hours."
      />

      <div style={{ ...monthNavStyle, marginTop: 14 }}>
        <button type="button" onClick={onPrevMonth} style={navBtnStyle} aria-label="Previous month">
          ◀
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
            {monthNames[month]} {year}
          </div>

          {isCurrentMonth ? (
            <div style={{ fontSize: 10, color: AMBER, fontWeight: 700, marginTop: 2 }}>
              Current Month
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          aria-label="Next month"
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
