/** Job Mitra | PublicHeader.tsx | Frosted public website header */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { JobMitraBrandName } from "../../../shared/components/brand/BrandName";

const ENTER_PATH = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;

export function PublicHeader() {
  return (
    <header className="wm-public-header">
      <JobMitraBrandName as="p" size="lg" className="wm-public-brand" />
      <nav className="wm-public-nav" aria-label="Public website">
        <Link to={ROUTE_PATHS.publicSite}>Home</Link>
        <Link to={ENTER_PATH}>Enter</Link>
      </nav>
    </header>
  );
}
