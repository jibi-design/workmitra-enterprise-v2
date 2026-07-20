// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnouncementsTabs.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnouncementsTabs.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

export type EmployerWorkforceAnnouncementsTabKey = "open" | "confirmed" | "completed";

type Props = {
  activeTab: EmployerWorkforceAnnouncementsTabKey;
  counts: Record<EmployerWorkforceAnnouncementsTabKey, number>;
  onChange: (tab: EmployerWorkforceAnnouncementsTabKey) => void;
};

const tabs: { key: EmployerWorkforceAnnouncementsTabKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 0,
  borderBottom: "2px solid var(--wm-er-border)",
  marginTop: 14,
};

const tabBtnBase: React.CSSProperties = {
  flex: 1,
  padding: "10px 0",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  textAlign: "center",
  borderBottom: "2px solid transparent",
  marginBottom: -2,
  transition: "color 0.15s, border-color 0.15s",
};

const countBadgeStyle = (isActive: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: 9,
  fontSize: 10,
  fontWeight: 800,
  marginLeft: 4,
  background: isActive ? AMBER : "var(--wm-er-border)",
  color: isActive ? "#fff" : "var(--wm-er-muted)",
});

export function EmployerWorkforceAnnouncementsTabs({ activeTab, counts, onChange }: Props) {
  return (
    <div style={tabBarStyle}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              ...tabBtnBase,
              color: isActive ? AMBER : "var(--wm-er-muted)",
              borderBottomColor: isActive ? AMBER : "transparent",
            }}
          >
            {tab.label}
            <span style={countBadgeStyle(isActive)}>{counts[tab.key]}</span>
          </button>
        );
      })}
    </div>
  );
}
