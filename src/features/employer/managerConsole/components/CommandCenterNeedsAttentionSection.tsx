// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CommandCenterNeedsAttentionSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\managerConsole\components\CommandCenterNeedsAttentionSection.tsx

import type { CSSProperties } from "react";

export type CommandCenterAlertItem = {
  id: string;
  label: string;
  count: number;
  color: string;
  bg: string;
  route: string;
};

const SECTION_CARD: CSSProperties = {
  padding: 16,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
};

const SECTION_TITLE: CSSProperties = {
  fontWeight: 900,
  fontSize: 14,
  color: "var(--wm-er-text)",
  marginBottom: 12,
};

type Props = {
  alerts: CommandCenterAlertItem[];
  onNavigate: (route: string) => void;
};

export function CommandCenterNeedsAttentionSection({ alerts, onNavigate }: Props) {
  const activeAlerts = alerts.filter((alert) => alert.count > 0);

  return (
    <div style={SECTION_CARD}>
      <div style={SECTION_TITLE}>Needs Your Attention</div>

      {activeAlerts.length === 0 ? (
        <div
          style={{
            padding: "14px 0",
            textAlign: "center",
            fontSize: 13,
            color: "#15803d",
            fontWeight: 700,
          }}
        >
          All clear — nothing needs your attention
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onNavigate(alert.route)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${alert.bg}`,
                background: alert.bg,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {alert.label}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    background: alert.color,
                    color: "#fff",
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {alert.count}
                </span>

                <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>Open</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
