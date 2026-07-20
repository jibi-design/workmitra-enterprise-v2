/** Job Mitra | EmployeeWorkVaultCard.tsx | src/features/employee/home/components/EmployeeWorkVaultCard.tsx */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export function WorkVaultCard() {
  const nav = useNavigate();
  const VAULT_COLOR = "#9333ea";

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeVaultHome);
  }, [nav]);

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      style={{
        cursor: "pointer",
        padding: "var(--wm-card-padding)",
        borderRadius: "var(--wm-radius-employee-card)",
        background: "#FFFFFF",
        border: "1px solid rgba(147, 51, 234, 0.15)",
        boxShadow: "var(--wm-emp-card-shadow)",
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
            background: "rgba(147, 51, 234, 0.08)",
            color: VAULT_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.01em",
            }}
          >
            My Work Vault
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", fontWeight: 400 }}>
            Secure work identity
          </p>
        </div>
      </div>
      <div style={{ color: "#CBD5E1", fontSize: 20 }}>→</div>
    </section>
  );
}
