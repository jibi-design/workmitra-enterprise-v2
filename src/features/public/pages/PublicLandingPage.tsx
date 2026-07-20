/** Job Mitra | PublicLandingPage.tsx | Public root landing skeleton */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";

export function PublicLandingPage() {
  return (
    <div className="wm-public-content">
      <h1 className="wm-public-landing-title">Job Mitra</h1>
      <p className="wm-public-landing-lead">
        Find work opportunities or explore hiring tools through Job Mitra.
      </p>

      <nav className="wm-public-landing-nav" aria-label="Public landing links">
        <Link className="wm-public-landing-link" to={ROUTE_PATHS.login}>
          Login
        </Link>
      </nav>

      <p className="wm-public-landing-note">Final visual design will follow the approved Figma.</p>
    </div>
  );
}
