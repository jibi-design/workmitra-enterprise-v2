/** Employer OS — three domain snapshot cards (Shift / Career / Planner). */

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
  return (
    <button
      type="button"
      className={`wm-erDashOsCard wm-erDashOsCard--${snap.domain}${selected ? " isSelected" : ""}`}
      data-testid={`employer-os-card-${snap.domain}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div className="wm-erDashOsCard__kicker">{snap.title}</div>
      <div className="wm-erDashOsCard__value">{snap.pendingCount}</div>
      <p className="wm-erDashOsCard__meta">{snap.pendingLabel}</p>
      <p className="wm-erDashOsCard__sub">
        {snap.openCount} {snap.openLabel.toLowerCase()} · {snap.confirmedCount}{" "}
        {snap.confirmedLabel.toLowerCase()}
      </p>
      {snap.extraLabel != null && snap.extraCount != null ? (
        <p className="wm-erDashOsCard__extra">
          {snap.extraCount} {snap.extraLabel.toLowerCase()}
        </p>
      ) : null}
    </button>
  );
}

export function EmployerDashMetricsCards({ shift, career, planner, selected, onSelect }: Props) {
  return (
    <section
      className="wm-erDashHero wm-erDashOsStrip wm-stable-row"
      data-testid="employer-dash-hero"
      aria-label="Shift, Career, and Planner snapshot"
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
