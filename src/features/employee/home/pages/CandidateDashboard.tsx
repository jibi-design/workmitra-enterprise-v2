/**
 * Pro-Level Candidate (Employee) Dashboard — Daily OS entry.
 * Canonical feature path. Re-exported from src/pages/candidate/CandidateDashboard.tsx.
 */

import { DailyOsDashboard } from "./DailyOsDashboard";

export type CandidateDashboardProps = {
  readonly showBackToHome?: boolean;
};

export function CandidateDashboard({ showBackToHome = true }: CandidateDashboardProps) {
  return <DailyOsDashboard showBackToHome={showBackToHome} />;
}

export default CandidateDashboard;
