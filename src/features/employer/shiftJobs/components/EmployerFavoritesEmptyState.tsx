// App name: Job Mitra
// File name: EmployerFavoritesEmptyState.tsx
// Ultra-Enterprise U4 — actionable EnterpriseEmpty

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

type EmployerFavoritesEmptyStateProps = {
  show: boolean;
};

export function EmployerFavoritesEmptyState({ show }: EmployerFavoritesEmptyStateProps) {
  const nav = useNavigate();
  if (!show) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <EnterpriseEmpty
        domain="shift"
        title="No favorites yet"
        subtitle='Rate a worker and select "Hire Again" to automatically add them here. Or add by Mitra Labs ID above.'
        primaryLabel="Open shift posts"
        onPrimary={() => nav(ROUTE_PATHS.employerShiftPosts)}
        secondaryLabel="Create shift"
        onSecondary={() => nav(ROUTE_PATHS.employerShiftCreate)}
        testId="shift-favorites-empty"
      />
    </div>
  );
}
