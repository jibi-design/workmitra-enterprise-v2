// App: Job Mitra / WorkMitra_Enterprise_v2
// File: SkillsSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\SkillsSection.tsx

import { VAULT_ACCENT, vaultAccentMix } from "../../constants/vaultConstants";
import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { Chip, SectionCard } from "./VaultProfileSharedUi";

export function SkillsSection({ data }: { data: VaultSectionData["skills"] }) {
  return (
    <SectionCard>
      {data.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--wm-emp-muted)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          No skills added yet. Update your profile to add skills.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {data.map((skill) => (
            <Chip
              key={skill.name}
              label={`${skill.name} - ${skill.proficiency.charAt(0).toUpperCase()}${skill.proficiency.slice(1)}`}
              color={VAULT_ACCENT}
              bg={`${vaultAccentMix(4)}`}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
