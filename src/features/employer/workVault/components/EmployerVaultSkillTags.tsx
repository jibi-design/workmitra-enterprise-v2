// src/features/employer/workVault/components/EmployerVaultSkillTags.tsx

import {
  VAULT_ACCENT,
  vaultAccentMix,
  type VaultSkillEntry,
} from "../../../shared/workVault/vaultPublic";

type Props = {
  skills: VaultSkillEntry[];
};

export function EmployerVaultSkillTags({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
        No skills added yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {skills.map((s) => (
        <span
          key={s.name}
          style={{
            height: 26,
            padding: "0 10px",
            borderRadius: "var(--wm-radius-pill)",
            fontSize: 11,
            fontWeight: 700,
            background: `${vaultAccentMix(3)}`,
            border: `1px solid ${vaultAccentMix(8)}`,
            color: VAULT_ACCENT,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {s.name}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "var(--wm-er-muted)",
              textTransform: "capitalize",
            }}
          >
            · {s.proficiency}
          </span>
        </span>
      ))}
    </div>
  );
}
