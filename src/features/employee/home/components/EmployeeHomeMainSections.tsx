/** Job Mitra | EmployeeHomeMainSections.tsx | Residual stack — diary + optional offers */

import type { ReactNode } from "react";
import type { HRCandidateRecord } from "../../../shared/hr/hrPublic";
import { OfferResponseCard } from "../../employment/components/OfferResponseCard";
import { CurrentEmploymentCard } from "./CurrentEmploymentCard";

type Props = {
  pendingOffers: HRCandidateRecord[];
  /** Kept for home wiring; HEAD Personal Work Diary card does not require hub open. */
  onOpenWorkplaceHub?: () => void;
};

/**
 * Home Personal Work Diary → `/employee/personal-work-diary` only.
 * Workplace Hub → Work Diary / Vault stay separate (employment + vault routes).
 */
export function EmployeeHomeMainSections({ pendingOffers, onOpenWorkplaceHub }: Props) {
  const items: ReactNode[] = [];

  for (const offer of pendingOffers) {
    items.push(<OfferResponseCard key={offer.id} record={offer} />);
  }

  items.push(
    <CurrentEmploymentCard key="current-employment" onOpenWorkplaceHub={onOpenWorkplaceHub} />,
  );

  return (
    <div className="wm-homeStack" data-testid="employee-home-gated-residual">
      {items}
    </div>
  );
}
