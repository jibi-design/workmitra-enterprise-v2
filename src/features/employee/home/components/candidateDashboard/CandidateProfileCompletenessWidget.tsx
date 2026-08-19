/** Candidate Pro — thin profile teaser (full checklist lives on /employee/profile). */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ProfileCompleteness } from "../../helpers/candidateDashboard.helpers";

type Props = {
  readonly completeness: ProfileCompleteness;
};

export function CandidateProfileCompletenessWidget({ completeness }: Props) {
  const nav = useNavigate();
  const incomplete = completeness.missing.length > 0;

  return (
    <section className="wm-dashWidget" data-testid="candidate-profile-completeness">
      <div className="wm-dashWidget__kicker">Profile</div>
      <h2 className="wm-dashWidget__title">
        {incomplete ? "Finish your profile" : "Profile ready"}
      </h2>
      <p className="wm-dashWidget__sub">
        {incomplete
          ? "Name, skills, and contact details are edited on your Profile page."
          : "Your profile checklist is complete — open Profile to review anytime."}
      </p>
      <button
        type="button"
        className="wm-outlineBtn wm-candWidgetCta"
        onClick={() => nav(ROUTE_PATHS.employeeProfile)}
      >
        {incomplete ? "Complete profile" : "Open profile"}
      </button>
    </section>
  );
}
