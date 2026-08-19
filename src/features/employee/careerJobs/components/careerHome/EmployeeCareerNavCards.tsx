// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerNavCards.tsx — Wave 2 Design DNA DomainCard

import { DomainCard } from "../../../../../shared/components/layout/designDna";

type Props = {
  activeJobCount: number;
  activeApplicationCount: number;
  onSearchJobs: () => void;
  onMyApplications: () => void;
};

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.5 4a5.5 5.5 0 0 1 4.36 8.86l.31.31h.83l4.25 4.24-1.84 1.84L13.17 15v-.83l-.31-.31A5.5 5.5 0 1 1 9.5 4Zm0 2A3.5 3.5 0 1 0 13 9.5 3.5 3.5 0 0 0 9.5 6Z"
      />
    </svg>
  );
}

function IconApplications() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-.8 2.4L17.6 8h-4.4V4.4ZM6 20V4h5v6h7v10H6Zm2-7h8v2H8v-2Zm0 4h6v2H8v-2Z"
      />
    </svg>
  );
}

export function EmployeeCareerNavCards({
  activeJobCount,
  activeApplicationCount,
  onSearchJobs,
  onMyApplications,
}: Props) {
  const appsFirst = activeApplicationCount > 0;
  const findCard = (
      <DomainCard
        domain="career"
        audience="employee"
        active={!appsFirst}
        stack
        title="Find Career Jobs"
        subtitle="Browse active long-term roles and choose where to apply."
        ariaLabel="Find Career Jobs"
        onClick={onSearchJobs}
        icon={<IconSearch />}
        iconStyle={{
          background: "color-mix(in srgb, var(--wm-career-accent, #2563eb) 12%, transparent)",
          color: "var(--wm-career-accent, #2563eb)",
        }}
      >
        <span className="wm-erDomainBadge" aria-hidden="true">
          <span className="wm-erDomainBadge__dot" />
          {activeJobCount > 0 ? `${activeJobCount} open` : "Start discovery"}
        </span>
      </DomainCard>
  );
  const appsCard = (
      <DomainCard
        domain="career"
        audience="employee"
        active={appsFirst}
        stack
        title="My Applications"
        subtitle="Track applications, interviews, offers, and next steps."
        ariaLabel="My Applications"
        onClick={onMyApplications}
        icon={<IconApplications />}
        iconStyle={{
          background: "color-mix(in srgb, var(--wm-career-accent, #2563eb) 12%, transparent)",
          color: "var(--wm-career-accent, #2563eb)",
        }}
      >
        <span className="wm-erDomainBadge" aria-hidden="true">
          <span className="wm-erDomainBadge__dot" />
          {activeApplicationCount > 0
            ? `${activeApplicationCount} in progress`
            : "Review progress"}
        </span>
      </DomainCard>
  );

  return (
    <section className="wm-stackGrid" data-testid="employee-career-nav-cards">
      <div>
        <div className="wm-typeCardTitle">Career actions</div>
        <div className="wm-typeHelper" style={{ marginTop: 3 }}>
          Continue from the right long-term work step.
        </div>
      </div>
      {appsFirst ? (
        <>
          {appsCard}
          {findCard}
        </>
      ) : (
        <>
          {findCard}
          {appsCard}
        </>
      )}
    </section>
  );
}
