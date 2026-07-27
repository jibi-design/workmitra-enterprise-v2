/** Job Mitra | EmployeeHomeMainSections.tsx | Domain stack with shared stagger motion */

import type { ReactNode } from "react";
import type { HRCandidateRecord } from "../../../shared/hr/hrPublic";
import { OfferResponseCard } from "../../employment/components/OfferResponseCard";
import {
  CareerJobsCard,
  GigProjectsCard,
  CurrentEmploymentCard,
  ShiftJobsCard,
  WorkforceCard,
  WorkVaultCard,
} from "./EmployeeHomeCards";
import { LAUNCH_VISIBILITY } from "../../../../shared/launch/launchVisibility";
import { EmployeeHomeGetStartedCard } from "./EmployeeHomeGetStartedCard";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";

type Props = {
  anyDomain: boolean;
  showShift: boolean;
  showCareer: boolean;
  pendingOffers: HRCandidateRecord[];
  onFindShifts: () => void;
  onCareerSearch: () => void;
};

const STAGGER = [
  "wm-homeCardEnter--1",
  "wm-homeCardEnter--2",
  "wm-homeCardEnter--3",
  "wm-homeCardEnter--4",
  "wm-homeCardEnter--5",
] as const;

function StaggerItem({ index, children }: { index: number; children: ReactNode }) {
  const delayClass = STAGGER[Math.min(index, STAGGER.length - 1)];
  return <div className={`wm-homeCardEnter ${delayClass}`}>{children}</div>;
}

export function EmployeeHomeMainSections({
  anyDomain,
  showShift,
  showCareer,
  pendingOffers,
  onFindShifts,
  onCareerSearch,
}: Props) {
  const items: ReactNode[] = [];
  let index = 0;

  if (!anyDomain) {
    items.push(
      <StaggerItem key="get-started" index={index++}>
        <EmployeeHomeGetStartedCard onFindShifts={onFindShifts} onCareerSearch={onCareerSearch} />
      </StaggerItem>,
    );
  }

  if (showShift) {
    items.push(
      <StaggerItem key="shift-jobs" index={index++}>
        <ShiftJobsCard />
      </StaggerItem>,
    );
    items.push(
      <StaggerItem key="gig-projects" index={index++}>
        <GigProjectsCard />
      </StaggerItem>,
    );
  }

  if (showCareer) {
    items.push(
      <StaggerItem key="career-jobs" index={index++}>
        <CareerJobsCard />
      </StaggerItem>,
    );
  }

  for (const offer of pendingOffers) {
    items.push(
      <StaggerItem key={offer.id} index={index++}>
        <OfferResponseCard record={offer} />
      </StaggerItem>,
    );
  }

  items.push(
    <StaggerItem key="current-employment" index={index++}>
      <CurrentEmploymentCard />
    </StaggerItem>,
  );

  if (LAUNCH_VISIBILITY.workforceOps) {
    items.push(
      <StaggerItem key="workforce" index={index++}>
        <WorkforceCard />
      </StaggerItem>,
    );
  }

  items.push(
    <StaggerItem key="work-vault" index={index++}>
      <WorkVaultCard />
    </StaggerItem>,
  );

  return (
    <HomeSectionPanel eyebrow="Workspace" title="Your work tools">
      {items}
    </HomeSectionPanel>
  );
}
