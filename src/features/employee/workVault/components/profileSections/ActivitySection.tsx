// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ActivitySection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\ActivitySection.tsx

import { formatDate, timeAgo } from "../../helpers/vaultHomeHelpers";
import type { VaultSectionData } from "../../services/vaultDataAggregator";

export function ActivitySection({ data }: { data: VaultSectionData["activity"] }) {
  return (
    <div className="wm-vault-activity-overview" data-testid="vault-activity-overview">
      <div className="wm-vault-activity-overview__title">Activity overview</div>
      <div className="wm-vault-activity-overview__pills">
        <div className="wm-vault-activity-overview__pill">
          <div className="wm-vault-activity-overview__pill-label">Member since</div>
          <div className="wm-vault-activity-overview__pill-value">
            {formatDate(data.memberSince)}
          </div>
        </div>
        <div className="wm-vault-activity-overview__pill">
          <div className="wm-vault-activity-overview__pill-label">Last active</div>
          <div className="wm-vault-activity-overview__pill-value">{timeAgo(data.lastActive)}</div>
        </div>
      </div>
    </div>
  );
}
