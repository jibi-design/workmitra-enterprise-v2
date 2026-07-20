// App name: Job Mitra
// File name: CompanyInfoSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\CompanyInfoSection.tsx

import { EmployerTrustBadge } from "../../../../../shared/employerProfile/EmployerTrustBadge";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "./shiftPostDetail.styles";
import { getSafeEntityText } from "./shiftPostDetail.utils";

export function CompanyInfoSection({ companyName }: { readonly companyName: string }) {
  const displayName = getSafeEntityText(companyName, "Employer not specified");

  return (
    <div className="wm-ee-card" style={CARD_STYLE}>
      <div style={SECTION_TITLE_STYLE}>Company info</div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: "var(--wm-er-text, #1e293b)",
          lineHeight: 1.35,
        }}
      >
        {displayName}
      </div>

      <div style={{ marginTop: 8 }}>
        <EmployerTrustBadge variant="full" />
      </div>
    </div>
  );
}
