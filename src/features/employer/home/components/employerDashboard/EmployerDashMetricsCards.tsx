/** Work this lane — domain switchers + quick create. Not the status ribbon. */

import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { laneFocusCopy } from "../../helpers/employerDashboard.laneFocus";
import type {
  EmployerOsDomain,
  EmployerOsDomainSnapshot,
} from "../../helpers/employerDashboard.osTypes";

type Props = {
  readonly shift: EmployerOsDomainSnapshot;
  readonly career: EmployerOsDomainSnapshot;
  readonly planner: EmployerOsDomainSnapshot;
  readonly selected: EmployerOsDomain;
  readonly onSelect: (domain: EmployerOsDomain) => void;
};

function DomainCard({
  snap,
  selected,
  onSelect,
}: {
  readonly snap: EmployerOsDomainSnapshot;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  const nav = useNavigate();
  const copy = laneFocusCopy(snap);

  function onPlus(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    event.preventDefault();
    nav(copy.plusHref);
  }

  return (
    <article
      className={`wm-erDashOsCard wm-erDashOsCard--${snap.domain}${selected ? " isSelected" : ""}${
        copy.empty ? " isIdle" : " isLive"
      }`}
      data-empty={copy.empty ? "true" : "false"}
    >
      <button
        type="button"
        className="wm-erDashOsCard__plus"
        data-testid={`employer-os-plus-${snap.domain}`}
        aria-label={copy.plusLabel}
        title={copy.plusLabel}
        onClick={onPlus}
      >
        +
      </button>
      <button
        type="button"
        className="wm-erDashOsCard__select"
        data-testid={`employer-os-card-${snap.domain}`}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span className="wm-erDashOsCard__kicker">{copy.title}</span>
        {copy.empty ? (
          <span className="wm-erDashOsCard__hint">{copy.hint}</span>
        ) : (
          <>
            <span className="wm-erDashOsCard__value">{copy.openLine}</span>
            <span className="wm-erDashOsCard__meta">{copy.pendingLine}</span>
          </>
        )}
      </button>
    </article>
  );
}

export function EmployerDashMetricsCards({ shift, career, planner, selected, onSelect }: Props) {
  return (
    <section
      className="wm-erDashHero wm-erDashOsStrip wm-stable-row"
      data-testid="employer-dash-hero"
      aria-label="Choose Shift, Career, or Planner to work"
    >
      <DomainCard snap={shift} selected={selected === "shift"} onSelect={() => onSelect("shift")} />
      <DomainCard
        snap={career}
        selected={selected === "career"}
        onSelect={() => onSelect("career")}
      />
      <DomainCard
        snap={planner}
        selected={selected === "planner"}
        onSelect={() => onSelect("planner")}
      />
    </section>
  );
}
