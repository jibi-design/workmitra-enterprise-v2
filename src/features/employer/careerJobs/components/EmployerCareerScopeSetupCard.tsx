/**
 * B-P1-4 — Actionable Career tenant setup when employer org/company id is missing.
 * Uses existing EnterpriseEmpty career accent — no blank/broken Career surfaces.
 */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import type { CareerEmployerScopeDenyReason } from "../../../shared/career/careerEmployerScope";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

type EmployerCareerScopeSetupCardProps = {
  reason: CareerEmployerScopeDenyReason;
};

function buildSubtitle(reason: CareerEmployerScopeDenyReason): string {
  const profile = employerSettingsStorage.get();
  const missing: string[] = [];

  if (!profile.companyName?.trim()) missing.push("company name");
  if (!(
    profile.employerOrgId?.trim() ||
    profile.companyUniqueId?.trim() ||
    profile.uniqueId?.trim()
  )) {
    missing.push("business / company ID");
  }

  if (reason === "invalid_org_id") {
    return "Your saved business ID is not valid for Career tenant isolation. Update company profile details, then return here.";
  }

  if (missing.length > 0) {
    return `Career Jobs need a complete business identity before posts, ATS, or vault review can load. Still needed: ${missing.join(", ")}.`;
  }

  return "Career Jobs need a verified business identity (org or company ID) before any tenant data is loaded. Complete your company profile, then return here.";
}

export function EmployerCareerScopeSetupCard({ reason }: EmployerCareerScopeSetupCardProps) {
  const nav = useNavigate();

  return (
    <div className="wm-er-vCareer wm-stackGrid" data-testid="employer-career-scope-setup">
      <EnterpriseEmpty
        domain="career"
        title="Set up business identity to open Career Jobs"
        subtitle={buildSubtitle(reason)}
        primaryLabel="Open company profile"
        onPrimary={() => nav(ROUTE_PATHS.employerProfile)}
        secondaryLabel="Employer home"
        onSecondary={() => nav(ROUTE_PATHS.employerHome)}
        testId="employer-career-scope-setup-card"
      />
      <section
        className="wm-card"
        style={{ padding: "16px 18px", maxWidth: 560 }}
        aria-label="Career setup checklist"
        data-testid="employer-career-scope-checklist"
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Before Career unlocks</div>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
          <li>Open Company Profile and enter your company name.</li>
          <li>Save the profile so a business / company ID is created.</li>
          <li>Return to Career Jobs — your posts and ATS stay in your tenant only.</li>
        </ol>
      </section>
    </div>
  );
}
