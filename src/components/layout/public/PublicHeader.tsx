/** Job Mitra | PublicHeader.tsx | Frosted public website header */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";

const ENTER_PATH = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;

export function PublicHeader() {
  return (
    <header className="wm-public-header">
      <p className="wm-public-brand">Job Mitra</p>
      <nav className="wm-public-nav" aria-label="Public website">
        <Link to={ROUTE_PATHS.publicSite}>Home</Link>
        <Link to={ENTER_PATH}>Enter</Link>
      </nav>
    </header>
  );
}
