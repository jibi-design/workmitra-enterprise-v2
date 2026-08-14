/** Job Mitra | EmployeeHomeCoreGrid.tsx | 2-col domain / Hub entry (dynamic nudges live above) */

import type { ReactNode } from "react";
import { CareerJobsCard, GigProjectsCard, ShiftJobsCard } from "./EmployeeJobCards";
import { UnifiedWorkplaceHubCard } from "./UnifiedWorkplaceHubCard";
import { EmployeeHomeGetStartedCard } from "./EmployeeHomeGetStartedCard";

type Props = {
  anyDomain: boolean;
  showShift: boolean;
  showCareer: boolean;
  onFindShifts: () => void;
  onCareerSearch: () => void;
  onOpenWorkplaceHub: () => void;
};

function GridCell({ children }: { children: ReactNode }) {
  return <div className="wm-homeCoreGrid__cell">{children}</div>;
}

export function EmployeeHomeCoreGrid({
  anyDomain,
  showShift,
  showCareer,
  onFindShifts,
  onCareerSearch,
  onOpenWorkplaceHub,
}: Props) {
  return (
    <section
      className="wm-homeCoreGrid"
      data-testid="employee-home-core-grid"
      aria-label="Home shortcuts"
    >
      {!anyDomain ? (
        <div className="wm-homeCoreGrid__cell wm-homeCoreGrid__cell--span2">
          <EmployeeHomeGetStartedCard onFindShifts={onFindShifts} onCareerSearch={onCareerSearch} />
        </div>
      ) : null}

      {showShift ? (
        <GridCell>
          <ShiftJobsCard />
        </GridCell>
      ) : null}

      {showCareer ? (
        <GridCell>
          <CareerJobsCard />
        </GridCell>
      ) : null}

      {showShift ? (
        <GridCell>
          <GigProjectsCard />
        </GridCell>
      ) : null}

      <GridCell>
        <UnifiedWorkplaceHubCard onOpen={onOpenWorkplaceHub} />
      </GridCell>
    </section>
  );
}
