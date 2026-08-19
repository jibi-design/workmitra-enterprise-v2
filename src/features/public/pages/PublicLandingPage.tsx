/** Job Mitra | PublicLandingPage.tsx | Marketing landing composition */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { LandingFooterLinks } from "../../auth/components/LandingFooterLinks";
import { PublicLandingDomainStrip } from "../components/PublicLandingDomainStrip";
import { PublicLandingHero } from "../components/PublicLandingHero";

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

const ENTER_PATH = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;

const TRUST_PROOF_ITEMS = [
  "Separate workspaces for employees and employers.",
  "Home screens highlight the next action you need to take.",
  "Sensitive records stay private — not shown on public pages.",
] as const;

export function PublicLandingPage() {
  const proofRef = useRef<HTMLDivElement>(null);
  const [proofRevealed, setProofRevealed] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduceMotion || typeof IntersectionObserver === "undefined";
  });

  useEffect(() => {
    if (proofRevealed) return;
    const root = proofRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setProofRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [proofRevealed]);

  return (
    <div className="wm-publicLanding">
      <PublicLandingHero
        enterPath={ENTER_PATH}
        explorePath={ROUTE_PATHS.explore}
        secondaryHref={PRIVACY_POLICY_URL}
        secondaryLabel="Privacy"
      />

      <section className="wm-publicLanding__section" aria-labelledby="public-proof-title">
        <p className="wm-publicLanding__eyebrow">Trust</p>
        <h2 className="wm-publicLanding__sectionTitle" id="public-proof-title">
          Built for careful work
        </h2>
        <div
          ref={proofRef}
          className={
            proofRevealed
              ? "wm-publicLanding__proof is-revealed"
              : "wm-publicLanding__proof is-pending"
          }
        >
          {TRUST_PROOF_ITEMS.map((text, index) => (
            <p
              key={text}
              className={
                proofRevealed
                  ? `wm-publicLanding__proofItem wm-animateScaleIn wm-publicLanding__proofItem--d${index}`
                  : "wm-publicLanding__proofItem"
              }
            >
              {text}
            </p>
          ))}
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
