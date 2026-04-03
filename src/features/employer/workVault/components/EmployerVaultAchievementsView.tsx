// src/features/employer/workVault/components/EmployerVaultAchievementsView.tsx

import type { VaultAchievement } from "../../../employee/workVault/types/vaultProfileTypes";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";

type Props = {
  achievements: VaultAchievement[];
};

export function EmployerVaultAchievementsView({ achievements }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {achievements.map((a) => (
        <div
          key={a.id}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${a.earned ? `${VAULT_ACCENT}18` : "var(--wm-er-divider, rgba(15, 23, 42, 0.08))"}`,
            background: a.earned ? `${VAULT_ACCENT}04` : "var(--wm-er-bg, #fff)",
            opacity: a.earned ? 1 : 0.5,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20 }}>{a.icon}</div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: a.earned ? VAULT_ACCENT : "var(--wm-er-muted)",
              marginTop: 4,
              lineHeight: 1.3,
            }}
          >
            {a.title}
          </div>
          {a.earned && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 900,
                marginTop: 4,
                padding: "1px 8px",
                borderRadius: 999,
                background: `${VAULT_ACCENT}08`,
                color: VAULT_ACCENT,
                display: "inline-block",
              }}
            >
              Earned
            </div>
          )}
        </div>
      ))}
    </div>
  );
}