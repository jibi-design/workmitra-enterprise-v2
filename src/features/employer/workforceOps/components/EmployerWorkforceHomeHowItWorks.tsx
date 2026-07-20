// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeHowItWorks.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeHowItWorks.tsx

import { stepCircleStyle } from "../../../../shared/domains/workforce/ui/workforceStyles";

const steps = [
  "Add your staff and organise them into categories",
  "Create an announcement — pick categories, set shifts and vacancies",
  "Your staff see the announcement and mark availability",
  "Review applications, confirm selections — a Work Group is created automatically",
  "Track attendance, communicate with your team, and rate after completion",
];

export function EmployerWorkforceHomeHowItWorks() {
  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>How it works</div>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {steps.map((text, index) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={stepCircleStyle}>{index + 1}</div>
            <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
