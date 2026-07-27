// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRolePickPage.tsx

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
const ROLE_ACCENT = "var(--wm-neutral-900)";

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
        desc: "Find shifts, apply jobs & track\u00A0work.",
        accent: ROLE_ACCENT,
        Icon: RoleIconEmployee,
      },
      {
        role: "employer" as const,
        title: "Employer",
        desc: "Post jobs, manage hiring & work\u00A0records.",
        accent: ROLE_ACCENT,
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
      className="wm-landing-role-pick"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "var(--wm-neutral-100)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "var(--wm-font-sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--wm-neutral-25, #fff)",
          borderRadius: "var(--wm-radius-24, 24px)",
          boxShadow:
            "0 24px 48px -12px color-mix(in srgb, var(--wm-neutral-900) 12%, transparent), 0 0 0 1px color-mix(in srgb, var(--wm-neutral-900) 4%, transparent)",
          padding: "36px 20px",
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
          className="wm-press-btn wm-primarybtn"
          onClick={() => goTo(selectedRole)}
          style={{
            width: "100%",
            marginTop: 28,
            padding: "14px 24px",
            borderRadius: "var(--wm-radius-12, 12px)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--wm-neutral-25, #fff)",
            background: "var(--wm-neutral-900)",
            border: "none",
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
