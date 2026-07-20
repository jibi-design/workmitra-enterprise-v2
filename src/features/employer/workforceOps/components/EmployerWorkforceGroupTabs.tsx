// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceGroupTabs.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceGroupTabs.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

export type EmployerWorkforceGroupTab = "chat" | "members" | "attendance";

type Props = {
  tab: EmployerWorkforceGroupTab;
  messageCount: number;
  activeMembers: number;
  onChange: (tab: EmployerWorkforceGroupTab) => void;
};

export function EmployerWorkforceGroupTabs({ tab, messageCount, activeMembers, onChange }: Props) {
  const tabs = [
    { key: "chat" as const, label: "Chat", count: messageCount },
    { key: "members" as const, label: "Members", count: activeMembers },
    { key: "attendance" as const, label: "Attendance" },
  ];

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
          {"count" in item && item.count !== undefined ? ` (${item.count})` : ""}
        </button>
      ))}
    </div>
  );
}
