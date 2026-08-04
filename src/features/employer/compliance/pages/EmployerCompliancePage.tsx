/** Job Mitra | EmployerCompliancePage — Business Compliance Hub (Wave 3) */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ComplianceExpiryBanner } from "../components/ComplianceExpiryBanner";
import { ComplianceShelfSection } from "../components/ComplianceShelfSection";
import { listExpiringComplianceDocuments } from "../helpers/employerComplianceExpiry";
import { employerComplianceStorage } from "../storage/employerCompliance.storage";
import { COMPLIANCE_SHELVES } from "../storage/employerCompliance.types";

export function EmployerCompliancePage() {
  const nav = useNavigate();
  const snapshot = useSyncExternalStore(
    employerComplianceStorage.subscribe,
    employerComplianceStorage.getSnapshot,
    employerComplianceStorage.getSnapshot,
  );

  const documents = useMemo(() => {
    void snapshot;
    return employerComplianceStorage.getAll();
  }, [snapshot]);

  const expiryRows = useMemo(() => listExpiringComplianceDocuments(documents), [documents]);

  return (
    <div className="wm-compPage" data-testid="employer-compliance-page">
      <header className="wm-compHero">
        <button
          type="button"
          className="wm-compHero__back"
          onClick={() => nav(ROUTE_PATHS.employerProfile)}
          aria-label="Back to company profile"
        >
          ← Profile
        </button>
        <div className="wm-compHero__kicker">Business essential</div>
        <h1 className="wm-compHero__title">Business Compliance Hub</h1>
        <p className="wm-compHero__sub">
          Employer-owned legal and compliance shelves. Separate from Worker Vault access and
          Personal Work Diary.
        </p>
      </header>

      <ComplianceExpiryBanner rows={expiryRows} />

      <div className="wm-compStack">
        {COMPLIANCE_SHELVES.map((shelf) => (
          <ComplianceShelfSection
            key={shelf.id}
            shelfId={shelf.id}
            title={shelf.title}
            description={shelf.description}
            documents={documents.filter((doc) => doc.shelf === shelf.id)}
          />
        ))}
      </div>
    </div>
  );
}
