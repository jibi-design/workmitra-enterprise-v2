/**
 * All Event Tools hub — /employer/labs
 * Pass counts + Open full report. Issue/QR stay on Dashboard Event day.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, FlaskConical } from "lucide-react";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { MitraLabsBrandName } from "../../../shared/components/brand/BrandName";
import { useAuthStore } from "../../../shared/store/authStore";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";
import { isPassValid } from "../helpers/mitraLabs.helpers";

export function MitraLabsHub() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const issuerId = user?.id ?? "";
  const passes = useMitraLabsStore((s) => s.passes);

  const metrics = useMemo(() => {
    const mine = issuerId ? passes.filter((p) => p.issuerId === issuerId) : passes;
    const active = mine.filter((p) => isPassValid(p)).length;
    const revoked = mine.filter((p) => p.status === "revoked").length;
    return { total: mine.length, active, revoked };
  }, [passes, issuerId]);

  return (
    <div className="wm-dashPage wm-erDash wm-mlPage" data-testid="mitra-labs-hub">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() => nav(ROUTE_PATHS.employerDashboardEventDay)}
        >
          ← Dashboard
        </button>
        <div className="wm-dashHero__kicker">
          <FlaskConical size={12} aria-hidden="true" /> <MitraLabsBrandName as="span" />
        </div>
        <h1 className="wm-dashHero__title">All Event Tools</h1>
        <p className="wm-dashHero__sub">
          Pass counts on this device. Open full report for folders, export, and backup.
        </p>
      </header>

      <section className="wm-dashWidget" data-testid="mitra-labs-pass-status" data-ui-state="active">
        <div className="wm-dashWidget__kicker">Pass status</div>
        <h2 className="wm-dashWidget__title">Passes</h2>
        <div className="wm-mlMetrics">
          <div className="wm-mlMetric">
            <div className="wm-dashWidget__kicker">Pass</div>
            <div className="wm-mlMetric__value">{metrics.total}</div>
          </div>
          <div className="wm-mlMetric">
            <div className="wm-dashWidget__kicker">Active now</div>
            <div className="wm-mlMetric__value">{metrics.active}</div>
          </div>
          <div className="wm-mlMetric">
            <div className="wm-dashWidget__kicker">Revoke</div>
            <div className="wm-mlMetric__value">{metrics.revoked}</div>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="wm-dashWidget wm-mlCta"
        data-testid="mitra-labs-open-report"
        onClick={() => nav(ROUTE_PATHS.employerLabsReport)}
      >
        <ClipboardList size={20} aria-hidden="true" />
        <span className="wm-mlCta__title">Open full report</span>
        <span className="wm-mlCta__sub">
          Event folders, attendance export, PDF backup, and delete
        </span>
      </button>
    </div>
  );
}

export default MitraLabsHub;
