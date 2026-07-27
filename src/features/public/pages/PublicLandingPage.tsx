/** Job Mitra | PublicLandingPage.tsx | Marketing landing composition */

import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { LandingFooterLinks } from "../../auth/components/LandingFooterLinks";
import { PublicLandingDomainStrip } from "../components/PublicLandingDomainStrip";
import { PublicLandingHero } from "../components/PublicLandingHero";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

const ENTER_PATH = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;

export function PublicLandingPage() {
  return (
    <div className="wm-publicLanding">
      <PublicLandingHero
        enterPath={ENTER_PATH}
        secondaryHref={PRIVACY_POLICY_URL}
        secondaryLabel="Privacy"
      />

      <section className="wm-publicLanding__section" aria-labelledby="public-proof-title">
        <p className="wm-publicLanding__eyebrow">Trust</p>
        <h2 className="wm-publicLanding__sectionTitle" id="public-proof-title">
          Built for careful work
        </h2>
        <div className="wm-publicLanding__proof">
          <p className="wm-publicLanding__proofItem">
            Role-separated workspaces for employees and employers.
          </p>
          <p className="wm-publicLanding__proofItem">
            Action hubs surface only what needs a decision next.
          </p>
          <p className="wm-publicLanding__proofItem">
            Sensitive records stay behind sealed storage patterns — not in public chrome.
          </p>
        </div>
      </section>

      <PublicLandingDomainStrip />

      <section className="wm-publicLanding__section" aria-labelledby="public-how-title">
        <p className="wm-publicLanding__eyebrow">How it works</p>
        <h2 className="wm-publicLanding__sectionTitle" id="public-how-title">
          Three steps to start
        </h2>
        <div className="wm-publicLanding__steps">
          <article className="wm-publicLanding__step">
            <h3 className="wm-publicLanding__stepTitle">Enter the workspace</h3>
            <p className="wm-publicLanding__stepCopy">
              Open the app entry and pick employee or employer for this session.
            </p>
          </article>
          <article className="wm-publicLanding__step">
            <h3 className="wm-publicLanding__stepTitle">Choose your domain</h3>
            <p className="wm-publicLanding__stepCopy">
              Use Shift, Career, Vault, or Planner — each stays on its own track.
            </p>
          </article>
          <article className="wm-publicLanding__step">
            <h3 className="wm-publicLanding__stepTitle">Act on what matters</h3>
            <p className="wm-publicLanding__stepCopy">
              Pending actions and domain cards keep the next step visible.
            </p>
          </article>
        </div>
      </section>

      <footer className="wm-publicLanding__footerLinks">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
        <span aria-hidden="true">·</span>
        <Link to={ENTER_PATH}>Login</Link>
      </footer>
    </div>
  );
}
