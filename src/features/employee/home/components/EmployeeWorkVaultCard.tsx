/** Job Mitra | EmployeeWorkVaultCard.tsx | Glass vault card */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

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
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeVaultHome);
  }, [nav]);

  return (
    <HomeGlassCardShell
      audience="employee"
      title="My Work Vault"
      subtitle="Secure work identity"
      ariaLabel="Open Work Vault"
      onClick={handleOpen}
      icon={<VaultIcon />}
      iconStyle={{
        background: "color-mix(in srgb, var(--wm-vault-accent, #9333ea) 12%, transparent)",
        color: "var(--wm-vault-accent, #9333ea)",
      }}
      trailing={
        <span className="wm-homeGlassCard__chevron" aria-hidden="true">
          →
        </span>
      }
    />
  );
}
