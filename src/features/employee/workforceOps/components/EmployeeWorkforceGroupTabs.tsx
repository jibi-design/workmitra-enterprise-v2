// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupTabs.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupTabs.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

export type EmployeeWorkforceGroupTab = "chat" | "shifts" | "exit";

type Props = {
  tab: EmployeeWorkforceGroupTab;
  onChange: (tab: EmployeeWorkforceGroupTab) => void;
};

const tabs: { key: EmployeeWorkforceGroupTab; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "shifts", label: "My Shifts" },
  { key: "exit", label: "Exit" },
];

export function EmployeeWorkforceGroupTabs({ tab, onChange }: Props) {
  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        gap: 0,
        borderRadius: "var(--wm-radius-10)",
        overflow: "hidden",
        border: "1px solid var(--wm-er-border)",
      }}
    >
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          style={{
            flex: 1,
            padding: "9px 6px",
            border: "none",
            background: tab === item.key ? AMBER : "var(--wm-er-card)",
            color: tab === item.key ? "#fff" : "var(--wm-er-text)",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
