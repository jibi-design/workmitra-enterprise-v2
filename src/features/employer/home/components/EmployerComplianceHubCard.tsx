/** Job Mitra | EmployerComplianceHubCard.tsx | src/features/employer/home/components/EmployerComplianceHubCard.tsx */

import { useNavigate } from "react-router-dom";
import { FileCheck2 } from "lucide-react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

const COMPLIANCE_ACCENT = "var(--wm-compliance-accent, #b45309)";

export function ComplianceHubCard() {
  const nav = useNavigate();

  return (
    <HomeGlassCardShell
      audience="employer"
      title="Business Compliance"
      subtitle="Insurance, H&S, RTW audit"
      ariaLabel="Open Business Compliance Hub"
      onClick={() => nav(ROUTE_PATHS.employerCompliance)}
      icon={<FileCheck2 size={22} />}
      iconStyle={{
        background: "color-mix(in srgb, #b45309 12%, transparent)",
        color: COMPLIANCE_ACCENT,
      }}
      trailing={
        <span className="wm-homeGlassCard__chevron" aria-hidden="true">
          →
        </span>
      }
    />
  );
}
