/** Job Mitra | DomainHero.tsx — Unified domain home hero primitive (Golden Rulebook Step 1) */

import type { ReactNode } from "react";

export type DomainHeroVariant = "shift" | "career" | "planner";
export type DomainHeroAudience = "employer" | "employee";

export type DomainHeroProps = {
  variant: DomainHeroVariant;
  audience: DomainHeroAudience;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
};

function buildHeroClass(
  variant: DomainHeroVariant,
  audience: DomainHeroAudience,
  className?: string,
): string {
  return ["wm-domainHero", `wm-domainHero--${variant}`, `wm-domainHero--${audience}`, className]
    .filter(Boolean)
    .join(" ");
}

export function DomainHero({
  variant,
  audience,
  eyebrow,
  title,
  subtitle,
  description,
  icon,
  trailing,
  children,
  className,
}: DomainHeroProps) {
  const showTopRow = icon || title || subtitle || eyebrow || trailing;

  return (
    <section className={buildHeroClass(variant, audience, className)} aria-label={title}>
      {showTopRow ? (
        <div className="wm-domainHeroTop">
          <div className="wm-domainHeroIdentity">
            {icon ? <div className="wm-domainHeroIcon">{icon}</div> : null}

            <div className="wm-domainHeroTextBlock">
              {eyebrow ? <span className="wm-domainHeroEyebrow">{eyebrow}</span> : null}
              <h1 className="wm-domainHeroTitle">{title}</h1>
              {subtitle ? <p className="wm-domainHeroSubtitle">{subtitle}</p> : null}
            </div>
          </div>

          {trailing ? <div className="wm-domainHeroTrailing">{trailing}</div> : null}
        </div>
      ) : null}

      {description ? <p className="wm-domainHeroDescription">{description}</p> : null}

      {children ? <div className="wm-domainHeroBody">{children}</div> : null}
    </section>
  );
}
