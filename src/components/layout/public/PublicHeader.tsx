/** Job Mitra | PublicHeader.tsx | Public website header placeholder */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";

export function PublicHeader() {
  return (
    <header className="wm-public-header">
      <p className="wm-public-brand">Job Mitra</p>
      <nav className="wm-public-nav" aria-label="Public website">
        <Link to={ROUTE_PATHS.landing}>Home</Link>
        <Link to={ROUTE_PATHS.login}>Login</Link>
      </nav>
    </header>
  );
}
