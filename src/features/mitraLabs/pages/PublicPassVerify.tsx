/**
 * Public pass verification — /labs/pass/verify/:token
 * Cloud lookup via public Event Day API. App-less web scan.
 */

import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { JobMitraBrandName, MitraLabsBrandName } from "../../../shared/components/brand/BrandName";
import { PublicPassGatePinModal } from "../components/PublicPassGatePinModal";
import { PublicPassVerifyCard } from "../components/PublicPassVerifyCard";
import { usePublicPassVerify } from "../hooks/usePublicPassVerify";

export function PublicPassVerify() {
  const { token: rawToken } = useParams<{ token: string }>();
  const token = rawToken ? decodeURIComponent(rawToken) : "";
  const verify = usePublicPassVerify(token);

  return (
    <div
      className="wm-mlVerifyPage"
      data-testid="public-pass-verify"
      data-ui-state={verify.uiState}
    >
      <header className="wm-mlVerifyPage__header">
        <JobMitraBrandName as="h1" size="lg" />
        <p className="wm-mlVerifyPage__subtitle">Gate Verification Portal</p>
      </header>

      <main className="wm-mlVerifyPage__main">
        {verify.uiState === "loading" ? (
          <div
            className="wm-dashWidget wm-mlVerifyCard"
            data-ui-state="loading"
            data-testid="public-pass-verify-loading"
          >
            <p className="wm-dashWidget__sub">Looking up this pass in the cloud…</p>
          </div>
        ) : null}

        {verify.uiState === "error" ? (
          <div className="wm-ent-error" data-ui-state="error" data-testid="public-pass-verify-error">
            <div className="wm-ent-error__title">Could not verify this pass</div>
            <div className="wm-ent-error__subtitle">{verify.error}</div>
            <button type="button" className="wm-outlineBtn" onClick={() => void verify.retry()}>
              Try again
            </button>
          </div>
        ) : null}

        {verify.uiState === "empty" || verify.uiState === "active" ? (
          <PublicPassVerifyCard
            badge={verify.badge}
            pass={verify.pass}
            checkedInAt={verify.checkedInAt ?? undefined}
            onOpenCheckIn={verify.openCheckIn}
          />
        ) : null}

        {verify.fromCache ? (
          <p className="wm-dashWidget__sub" data-testid="public-pass-verify-cache-note">
            Showing this device cache. Cloud sync will run when the gate is online. PIN is never
            queued.
          </p>
        ) : null}
      </main>

      <footer className="wm-mlVerifyPage__footer">
        <p className="wm-mlVerifyPage__powered">
          Powered by Mitra Access Hub
          <span aria-hidden="true"> | </span>
          <MitraLabsBrandName as="span" size="sm" />
        </p>
        <Link className="wm-outlineBtn wm-mlVerifyPage__back" to={ROUTE_PATHS.landing}>
          Back to Job Mitra
        </Link>
      </footer>

      <PublicPassGatePinModal
        open={verify.pinOpen}
        pin={verify.pin}
        error={verify.pinError}
        busy={verify.busy}
        onPinChange={verify.setPin}
        onSubmit={() => void verify.submitCheckIn()}
        onClose={verify.closeCheckIn}
      />
    </div>
  );
}

export default PublicPassVerify;
