// App name: Job Mitra
// File name: JobTypeBadge.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\JobTypeBadge.tsx

import { SHIFT_GREEN } from "./shiftPostDetail.styles";
import { formatJobType } from "./shiftPostDetail.utils";

export function JobTypeBadge({ jobType }: { readonly jobType?: string }) {
  if (!jobType) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(22,163,74,0.08)",
          color: SHIFT_GREEN,
          border: "1px solid rgba(22,163,74,0.2)",
        }}
      >
        {formatJobType(jobType)}
      </span>
    </div>
  );
}
