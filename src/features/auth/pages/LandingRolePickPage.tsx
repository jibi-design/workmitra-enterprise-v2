// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRolePickPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\pages\LandingRolePickPage.tsx

import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { resolvePostAuthRoute, sanitizeAppRoute } from "../../../app/router/pendingRoute";
import { roleStorage, type AppRole } from "../../../app/storage/roleStorage";
import { LandingExistingWorkspaceBanner } from "../components/LandingExistingWorkspaceBanner";
import { LandingFooterLinks } from "../components/LandingFooterLinks";
import { LandingRoleHero } from "../components/LandingRoleHero";
import {
  LandingRoleSelectionPanel,
  RoleIconEmployee,
  RoleIconEmployer,
  type LandingRoleCard,
} from "../components/LandingRoleSelectionPanel";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

function routeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function LandingRolePickPage() {
  const nav = useNavigate();
  const location = useLocation();
  const storedRole = roleStorage.get();
  const [existing, setExisting] = useState<AppRole | null>(storedRole);
  const [selectedRole, setSelectedRole] = useState<AppRole>(storedRole ?? "employee");
  const isNavigatingRef = useRef(false);

  const roleCards: LandingRoleCard[] = useMemo(
    () => [
      {
        role: "employee" as const,
        title: "Employee",
        /* Changed 'and' to '&' and added \u00A0 (Non-breaking space) to prevent lonely words */
        desc: "Find shifts, apply jobs & track\u00A0work.",
        accent: "#0F172A",
        Icon: RoleIconEmployee,
      },
      {
        role: "employer" as const,
        title: "Employer",
        desc: "Post jobs, manage hiring & work\u00A0records.",
        accent: "#0F172A",
        Icon: RoleIconEmployer,
      },
    ],
    [],
  );

  function goTo(role: AppRole) {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    roleStorage.set(role);
    setExisting(role);

    const stateFrom = (location.state as { from?: string } | null)?.from;
    const fallback = routeForRole(role);
    const rawTarget =
      stateFrom && stateFrom.startsWith(`/${role}`)
        ? stateFrom
        : resolvePostAuthRoute(role, fallback);
    const target = sanitizeAppRoute(rawTarget, role, fallback);

    nav(target, { replace: true });

    queueMicrotask(() => {
      isNavigatingRef.current = false;
    });
  }

  function clearExistingWorkspace() {
    roleStorage.clear();
    setExisting(null);
  }

  const selectedCard = roleCards.find((card) => card.role === selectedRole) ?? roleCards[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#F1F5F9" /* Slightly deeper enterprise slate */,
        alignItems: "center",
        justifyContent: "center",
        padding: 16 /* Reduced outer padding for mobile screens */,
        fontFamily: `"Inter", "SF Pro Display", system-ui, sans-serif`,
      }}
    >
      {/* STRICT ENTERPRISE AUTH PANEL */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          borderRadius: 24,
          /* Upgraded Shadow & Premium Inset Glow */
          boxShadow:
            "0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
          padding: "36px 20px" /* Optimized inner padding to give cards more width */,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LandingRoleHero />

        {existing && (
          <div style={{ marginBottom: 24 }}>
            <LandingExistingWorkspaceBanner
              existing={existing}
              onContinue={() => goTo(existing)}
              onClear={clearExistingWorkspace}
            />
          </div>
        )}

        <LandingRoleSelectionPanel
          roleCards={roleCards}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />

        <button
          type="button"
          className="wm-press-btn"
          onClick={() => goTo(selectedRole)}
          style={{
            width: "100%",
            marginTop: 28,
            padding: "14px 24px",
            borderRadius: 12 /* Sharp Enterprise Button */,
            fontSize: 15,
            fontWeight: 600,
            color: "#FFFFFF",
            background: "#0F172A",
            border: "none",
            /* The 'Apple Hardware' Button Inset Shadow Fix */
            boxShadow:
              "0 6px 16px -4px rgba(15, 23, 42, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            cursor: "pointer",
          }}
        >
          Continue to {selectedCard.title}
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
