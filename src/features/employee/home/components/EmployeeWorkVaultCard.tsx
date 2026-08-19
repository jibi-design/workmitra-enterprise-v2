/** Job Mitra | EmployeeWorkVaultCard.tsx | Purple Work Vault home tile */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { DomainCard } from "../../../../shared/components/layout/designDna";
import {
  DOMAIN_BY_KEY,
  domainAccentCssVar,
  getDomainCopy,
} from "../../../../shared/config/domainRegistry";
import { PulseNode } from "../../../pulse/PulseNode";

function VaultIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function WorkVaultCard() {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.vault;
  const accent = domainAccentCssVar("vault");
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeVaultHome);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-vault-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <DomainCard
        domain="vault"
        title={domain.title}
        subtitle={getDomainCopy("vault", "employee")}
        ariaLabel={`Open ${domain.title}`}
        onClick={handleOpen}
        icon={<VaultIcon />}
        iconStyle={{
          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        <span className="wm-homeVaultChip" aria-hidden="true">
          <span className="wm-homeVaultChip__dot" />
          Identity & records
        </span>
      </DomainCard>
    </PulseNode>
  );
}
