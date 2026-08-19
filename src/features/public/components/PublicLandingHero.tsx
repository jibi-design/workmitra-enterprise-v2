/** PublicLandingHero — brand-first first viewport + scroll-linked bg parallax */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { JobMitraBrandName } from "../../../shared/components/brand/BrandName";

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
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const bg = bgRef.current;
    if (!hero || !bg) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      bg.style.setProperty("--wm-hero-parallax", "0");
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = hero.getBoundingClientRect();
      // Subtle drift while hero is near the viewport (Apple-grade, not dramatic).
      const y = Math.max(-16, Math.min(16, -rect.top * 0.1));
      bg.style.setProperty("--wm-hero-parallax", String(y));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="wm-publicLanding__hero"
      aria-labelledby="public-landing-brand"
    >
      <div ref={bgRef} className="wm-publicLanding__heroBg" aria-hidden="true" />
      <JobMitraBrandName
        as="p"
        size="xl"
        className="wm-publicLanding__brand"
        id="public-landing-brand"
      />
      <h1 className="wm-publicLanding__headline">Shifts, careers, and the people who do the work.</h1>
      <p className="wm-publicLanding__support">
        Find shifts, hire nearby, and keep your work records in one place.
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
