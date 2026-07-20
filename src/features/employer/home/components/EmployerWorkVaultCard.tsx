/** Job Mitra | EmployerWorkVaultCard.tsx | src/features/employer/home/components/EmployerWorkVaultCard.tsx */

import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export function WorkVaultCard() {
  const nav = useNavigate();
  const VAULT_COLOR = "#9333ea";

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => nav(ROUTE_PATHS.employerVaultLookup)}
      style={{
        cursor: "pointer",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employer-card)",
        background: "#FFFFFF",
        border: "1px solid rgba(147, 51, 234, 0.12)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "transform var(--wm-motion-base) var(--wm-motion-spring)",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(147, 51, 234, 0.06)",
            color: VAULT_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Work Vault</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748B" }}>
            Secure employee records
          </p>
        </div>
      </div>
      <div style={{ color: "#CBD5E1", fontSize: 18 }}>→</div>
    </section>
  );
}
