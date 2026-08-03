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
    <div className="wm-auth-stage wm-landing-role-pick">
      <div className="wm-auth-panel wm-auth-panel--wide">
        <LandingRoleHero />

        {existing ? (
          <div className="wm-auth-banner-slot">
            <LandingExistingWorkspaceBanner
              existing={existing}
              onContinue={() => goTo(existing)}
              onClear={clearExistingWorkspace}
            />
          </div>
        ) : null}

        <LandingRoleSelectionPanel
          roleCards={roleCards}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />

        <button
          type="button"
          className="wm-press-btn wm-auth-continue"
          onClick={() => goTo(selectedRole)}
        >
          Continue to {selectedCard.title}
        </button>
      </div>

      <div className="wm-auth-footer">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
