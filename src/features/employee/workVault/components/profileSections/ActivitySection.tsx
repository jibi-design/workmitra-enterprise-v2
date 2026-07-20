// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ActivitySection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\ActivitySection.tsx

import { formatDate, timeAgo } from "../../helpers/vaultHomeHelpers";
import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { SectionCard } from "./VaultProfileSharedUi";

export function ActivitySection({ data }: { data: VaultSectionData["activity"] }) {
  return (
    <SectionCard>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>Member since</span>

          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {formatDate(data.memberSince)}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>Last active</span>

          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)" }}>
            {timeAgo(data.lastActive)}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
