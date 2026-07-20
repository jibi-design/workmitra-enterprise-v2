/** Job Mitra | EmployeeHomeMainSections.tsx | src/features/employee/home/components/EmployeeHomeMainSections.tsx */

import type { HRCandidateRecord } from "../../../employer/hrManagement/types/hrManagement.types";
import { OfferResponseCard } from "../../employment/components/OfferResponseCard";
import {
  CareerJobsCard,
  GigProjectsCard,
  CurrentEmploymentCard,
  InsightsCard,
  ShiftJobsCard,
  WorkforceCard,
  WorkVaultCard,
} from "./EmployeeHomeCards";
import { LAUNCH_VISIBILITY } from "../../../../shared/launch/launchVisibility";
import { EmployeeHomeGetStartedCard } from "./EmployeeHomeGetStartedCard";

/**
 * AUDIT NOTE:
 * Removed waitingList, confirmed, activeJobs, careerApplied,
 * careerInterviews, careerOffered, vaultFolders, vaultDocuments,
 * and earningsMonth as they are no longer needed for navigation-only cards.
 */
type Props = {
  anyDomain: boolean;
  showShift: boolean;
  showCareer: boolean;
  pendingOffers: HRCandidateRecord[];
  onFindShifts: () => void;
  onCareerSearch: () => void;
  onViewHistory: () => void;
};

export function EmployeeHomeMainSections({
  anyDomain,
  showShift,
  showCareer,
  pendingOffers,
  onFindShifts,
  onCareerSearch,
  onViewHistory,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!anyDomain && (
        <EmployeeHomeGetStartedCard onFindShifts={onFindShifts} onCareerSearch={onCareerSearch} />
      )}

      {/* Navigation Cards — PulseNode is already inside ShiftJobsCard / CareerJobsCard */}
      {showShift && <ShiftJobsCard />}

      {showShift && <GigProjectsCard />}

      {showCareer && <CareerJobsCard />}

      {pendingOffers.map((offer) => (
        <OfferResponseCard key={offer.id} record={offer} />
      ))}

      <CurrentEmploymentCard />

      {LAUNCH_VISIBILITY.workforceOps && <WorkforceCard />}

      <WorkVaultCard />

      <InsightsCard onViewHistory={onViewHistory} />
    </div>
  );
}
