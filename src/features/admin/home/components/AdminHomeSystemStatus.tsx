// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeSystemStatus.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeSystemStatus.tsx

import type { AdminHomeData } from "./AdminHomeSharedUi";
import { Sec } from "./AdminHomeSharedUi";

type Props = {
  data: AdminHomeData;
  formatBytes: (bytes: number) => string;
  relativeTime: (timestamp: number) => string;
};

export function AdminHomeSystemStatus({ data, formatBytes, relativeTime }: Props) {
  return (
    <>
      <Sec label="System Status" />

      <div className="wm-ad-healthBar">
        <div className="wm-ad-healthDot" />

        <div>
          <div className="wm-ad-healthTitle">All Systems Operational</div>
          <div className="wm-ad-healthSub">Monitoring local workspace health.</div>

          <div className="wm-ad-healthStats">
            <span className="wm-ad-healthStat">
              Storage: <strong>{formatBytes(data.storageBytes)}</strong>
            </span>

            <span className="wm-ad-healthStat">
              Keys: <strong>{data.storageKeys}</strong>
            </span>

            {data.lastActivityTs > 0 && (
              <span className="wm-ad-healthStat">
                Last: <strong>{relativeTime(data.lastActivityTs)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
