/** Job Mitra | EnterpriseEmpty.tsx | Actionable empty state */

import type { ReactNode } from "react";
import type { EnterpriseDomainAccent } from "./enterprise.types";

export type EnterpriseEmptyProps = {
  title: string;
  subtitle: ReactNode;
  domain?: EnterpriseDomainAccent;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  icon?: ReactNode;
  testId?: string;
};

export function EnterpriseEmpty({
  title,
  subtitle,
  domain,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  icon,
  testId,
}: EnterpriseEmptyProps) {
  return (
    <section
      className={`wm-ent-empty${domain ? ` wm-ent-empty--${domain}` : ""}`}
      data-testid={testId ?? "wm-ent-empty"}
    >
      {icon ? <div aria-hidden="true">{icon}</div> : null}
      <div className="wm-ent-empty__title">{title}</div>
      <div className="wm-ent-empty__subtitle">{subtitle}</div>
      {(primaryLabel && onPrimary) || (secondaryLabel && onSecondary) ? (
        <div className="wm-ent-empty__cta">
          {primaryLabel && onPrimary ? (
            <button type="button" className="wm-primarybtn" onClick={onPrimary}>
              {primaryLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button type="button" className="wm-outlineBtn" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
