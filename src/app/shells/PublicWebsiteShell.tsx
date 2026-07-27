/** Job Mitra | PublicWebsiteShell.tsx | Public website layout boundary */

import { Outlet } from "react-router-dom";
import { PublicFooter } from "../../components/layout/public/PublicFooter";
import { PublicHeader } from "../../components/layout/public/PublicHeader";
import "../theme/public.css";
import "../theme/public-landing.css";

export function PublicWebsiteShell() {
  return (
    <div className="wm-shellPublic">
      <PublicHeader />
      <main className="wm-public-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
