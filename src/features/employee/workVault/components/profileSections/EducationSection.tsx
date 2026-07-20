// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EducationSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\EducationSection.tsx

import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { SectionCard } from "./VaultProfileSharedUi";

export function EducationSection({ data }: { data: VaultSectionData["education"] }) {
  return (
    <SectionCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {data.level === "none"
              ? "Not set"
              : data.level.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
          </div>

          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 2 }}>
            {data.certifications.length} certification{data.certifications.length !== 1 ? "s" : ""}
          </div>
        </div>

        <span style={{ fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 700 }}>Open</span>
      </div>
    </SectionCard>
  );
}
