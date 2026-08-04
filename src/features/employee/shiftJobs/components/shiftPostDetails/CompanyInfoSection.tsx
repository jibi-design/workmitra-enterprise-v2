// App name: Job Mitra | CompanyInfoSection.tsx — surface-glass (post-details polish)

import { EmployerTrustBadge } from "../../../../../shared/employerProfile/EmployerTrustBadge";
import { SECTION_PAD, SECTION_TITLE_STYLE } from "./shiftPostDetail.styles";
import { getSafeEntityText } from "./shiftPostDetail.utils";

export function CompanyInfoSection({ companyName }: { readonly companyName: string }) {
  const displayName = getSafeEntityText(companyName, "Employer not specified");

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
      data-testid="shift-post-company"
      style={{ ...SECTION_PAD, animationDelay: "60ms" }}
    >
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
        <EmployerTrustBadge variant="full" showEmptyHint />
      </div>
    </section>
  );
}
