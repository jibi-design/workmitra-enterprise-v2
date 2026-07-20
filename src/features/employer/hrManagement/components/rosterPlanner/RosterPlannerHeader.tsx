// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterPlannerHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterPlanner\RosterPlannerHeader.tsx

import type { RosterViewMode } from "../../types/rosterPlanner.types";

const VIEW_TABS: { key: RosterViewMode; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

type Props = {
  view: RosterViewMode;
  navTitle: string;
  successMsg: string;
  onViewChange: (view: RosterViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function RosterPlannerHeader({
  view,
  navTitle,
  successMsg,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(180,83,9,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "#b45309",
          }}
        >
          Cal
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--wm-er-text)" }}>
            Team Calendar
          </div>

          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
            Assign staff to sites and shifts
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          marginBottom: 10,
        }}
      >
        {VIEW_TABS.map((tab) => {
          const isActive = view === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onViewChange(tab.key)}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#fff" : "var(--wm-er-muted)",
                background: isActive ? "#b45309" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onPrev}
          style={{
            background: "none",
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 6,
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-er-text)",
          }}
        >
          Previous
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-text)" }}>
            {navTitle}
          </div>

          <button
            type="button"
            onClick={onToday}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-er-accent-console, #0369a1)",
              padding: 0,
              marginTop: 2,
            }}
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={onNext}
          style={{
            background: "none",
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 6,
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-er-text)",
          }}
        >
          Next
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          {successMsg}
        </div>
      )}
    </div>
  );
}
