// src/features/employer/workVault/components/EmployerVaultAchievementsView.tsx

import {
  VAULT_ACCENT,
  vaultAccentMix,
  type VaultAchievement,
} from "../../../shared/workVault/vaultPublic";

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
            borderRadius: "var(--wm-radius-10)",
            border: `1px solid ${a.earned ? `${vaultAccentMix(10)}` : "var(--wm-er-divider, rgba(15, 23, 42, 0.08))"}`,
            background: a.earned ? `${vaultAccentMix(2)}` : "var(--wm-er-bg, #fff)",
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
                borderRadius: "var(--wm-radius-pill)",
                background: `${vaultAccentMix(4)}`,
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
