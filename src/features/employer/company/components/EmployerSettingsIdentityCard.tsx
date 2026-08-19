/** Thin identity snapshot — full company/KYC edit lives on /employer/profile. */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useAuthStore } from "../../../../shared/store/authStore";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
} from "../helpers/settingsStyles";

type Props = {
  profile: EmployerProfile;
};

function levelLabel(level: number | undefined): string {
  if (!level || level <= 0) return "Unverified";
  if (level === 1) return "Basic";
  if (level === 2) return "Verified";
  return `Level ${level}`;
}

export function EmployerSettingsIdentityCard({ profile }: Props) {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const company = profile.companyName.trim() || "Company not set";
  const owner = user?.fullName?.trim() || "—";

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
            />
          </svg>
        </div>
        <h2 style={sectionTitleStyle}>Account snapshot</h2>
      </div>

      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
        {company}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--wm-er-muted)" }}>
        Owner: {owner} · KYC: {levelLabel(profile.verificationLevel)}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.4 }}>
        Company details, owner identity, and verification are edited on Company Profile.
      </p>

      <button
        type="button"
        className="wm-outlineBtn"
        style={{ marginTop: 10, fontSize: 12 }}
        onClick={() => nav(ROUTE_PATHS.employerProfile)}
      >
        Open company profile
      </button>
    </div>
  );
}
