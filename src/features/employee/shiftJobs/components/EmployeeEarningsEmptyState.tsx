// App name: Job Mitra | EmployeeEarningsEmptyState.tsx

import { EARNINGS_GREEN } from "../helpers/employeeEarnings.helpers";

const PLANNER_TEAL = "#0891b2";

type Props = {
  domain?: "shift" | "planner";
};

export function EmployeeEarningsEmptyState({ domain = "shift" }: Props) {
  const isPlanner = domain === "planner";
  const accent = isPlanner ? PLANNER_TEAL : EARNINGS_GREEN;

  return (
    <div className="wm-ee-card" style={{ marginTop: 14, padding: 28, textAlign: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          margin: "0 auto 12px",
          background: isPlanner ? "rgba(8,145,178,0.08)" : "rgba(22,163,74,0.08)",
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptyEarningsIcon />
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
        No earnings yet
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.6 }}>
        {isPlanner
          ? "Gig project pay records appear here after confirmed plan days."
          : "Your earnings will appear here once you are confirmed for a shift."}
      </div>
    </div>
  );
}

function EmptyEarningsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 5.13 2 9v6c0 3.87 4.48 7 10 7s10-3.13 10-7V9c0-3.87-4.48-7-10-7Zm0 2c4.42 0 8 2.24 8 5s-3.58 5-8 5-8-2.24-8-5 3.58-5 8-5Zm0 16c-4.42 0-8-2.24-8-5v-2.03C5.83 14.8 8.73 16 12 16s6.17-1.2 8-3.03V15c0 2.76-3.58 5-8 5Z"
      />
    </svg>
  );
}
