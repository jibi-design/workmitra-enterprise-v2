/** Job Mitra | EmployerWorkVaultCard.tsx | src/features/employer/home/components/EmployerWorkVaultCard.tsx */

import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

const VAULT_ACCENT = "var(--wm-vault-accent, #9333ea)";

export function WorkVaultCard() {
  const nav = useNavigate();

  return (
    <HomeGlassCardShell
      audience="employer"
      title="Work Vault"
      subtitle="Secure employee records"
      ariaLabel="Open Work Vault"
      onClick={() => nav(ROUTE_PATHS.employerVaultLookup)}
      icon={<ShieldCheck size={22} />}
      iconStyle={{
        background: "color-mix(in srgb, var(--wm-vault-accent, #9333ea) 12%, transparent)",
        color: VAULT_ACCENT,
      }}
      trailing={
        <span aria-hidden="true" style={{ color: "#CBD5E1", fontSize: 18 }}>
          →
        </span>
      }
    />
  );
}
