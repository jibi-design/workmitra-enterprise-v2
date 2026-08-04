/** PublicLandingHero — brand-first first viewport */

import { Link } from "react-router-dom";

type PublicLandingHeroProps = {
  readonly enterPath: string;
  readonly explorePath?: string;
  readonly secondaryHref: string;
  readonly secondaryLabel: string;
};

export function PublicLandingHero({
  enterPath,
  explorePath,
  secondaryHref,
  secondaryLabel,
}: PublicLandingHeroProps) {
  return (
    <section className="wm-publicLanding__hero" aria-labelledby="public-landing-brand">
      <p className="wm-publicLanding__brand" id="public-landing-brand">
        Job Mitra
      </p>
      <h1 className="wm-publicLanding__headline">Work tools for shifts, careers, and teams.</h1>
      <p className="wm-publicLanding__support">
        One companion for finding work, hiring locally, and keeping records organized.
      </p>
      <div className="wm-publicLanding__ctas">
        {explorePath ? (
          <Link
            className="wm-publicLanding__cta wm-publicLanding__cta--primary wm-press-btn"
            to={explorePath}
          >
            Explore without signing in
          </Link>
        ) : null}
        <Link
          className={`wm-publicLanding__cta wm-press-btn${explorePath ? " wm-publicLanding__cta--secondary" : " wm-publicLanding__cta--primary"}`}
          to={enterPath}
        >
          Enter workspace
        </Link>
        <a
          className="wm-publicLanding__cta wm-publicLanding__cta--secondary wm-press-btn"
          href={secondaryHref}
          target="_blank"
          rel="noreferrer"
        >
          {secondaryLabel}
        </a>
      </div>
    </section>
  );
}
