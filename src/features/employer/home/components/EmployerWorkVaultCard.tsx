/** Job Mitra | EmployerWorkVaultCard.tsx | Standalone Work Vault tile (Vault Violet) */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ActionPill, DomainCard } from "../../../../shared/components/layout/designDna";
import {
  DOMAIN_BY_KEY,
  domainAccentCssVar,
  getDomainCopy,
} from "../../../../shared/config/domainRegistry";

export function WorkVaultCard() {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.vault;
  const accent = domainAccentCssVar("vault");
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerVaultLookup), [nav]);

  return (
    <DomainCard
      domain="vault"
      audience="employer"
      asDiv
      stack
      className="wm-erExecCard"
      title={domain.title}
      subtitle={getDomainCopy("vault", "employer")}
      ariaLabel={`Open ${domain.title}`}
      onClick={handleOpen}
      icon={<ShieldCheck size={22} />}
      iconStyle={{
        background: `color-mix(in srgb, ${accent} 12%, transparent)`,
        color: accent,
      }}
      trailing={
        <ActionPill
          bare
          domain="vault"
          className="wm-erCreateCta"
          aria-label="Access Work Vault lookup"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
        >
          + Access
        </ActionPill>
      }
    >
      <span className="wm-erDomainBadge" aria-hidden="true">
        <span className="wm-erDomainBadge__dot" />
        Ready to look up
      </span>
    </DomainCard>
  );
}
