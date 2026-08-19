// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRolePickPage.tsx — Employer DNA glass landing

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

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";
const ACCESS_HUB_URL = "https://mitraaccesshub.com";
const COMMIT_TRANSITION_MS = 280;

function routeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function LandingRolePickPage() {
  const nav = useNavigate();
  const location = useLocation();
  const storedRole = roleStorage.get();
  const [existing, setExisting] = useState<AppRole | null>(storedRole);
  const [selectedRole, setSelectedRole] = useState<AppRole>(storedRole ?? "employer");
  const [isCommitting, setIsCommitting] = useState(false);
  const isNavigatingRef = useRef(false);

  const roleCards: LandingRoleCard[] = useMemo(
    () => [
      {
        role: "employer" as const,
        title: "Employer",
        desc: "Post jobs and hire staff",
        accent: "hire",
        categoryBadge: "HIRING",
        Icon: RoleIconEmployer,
      },
      {
        role: "employee" as const,
        title: "Employee",
        desc: "Find and apply for jobs",
        accent: "candidate",
        categoryBadge: "JOBS",
        Icon: RoleIconEmployee,
      },
    ],
    [],
  );

  function goTo(role: AppRole) {
    if (isNavigatingRef.current || isCommitting) return;
    isNavigatingRef.current = true;

    roleStorage.set(role);
    setExisting(role);
    setSelectedRole(role);

    const stateFrom = (location.state as { from?: string } | null)?.from;
    const fallback = routeForRole(role);
    const rawTarget =
      stateFrom && stateFrom.startsWith(`/${role}`)
        ? stateFrom
        : resolvePostAuthRoute(role, fallback);
    const target = sanitizeAppRoute(rawTarget, role, fallback);

    const finish = () => {
      nav(target, { replace: true });
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    setIsCommitting(true);
    window.setTimeout(finish, COMMIT_TRANSITION_MS);
  }

  function clearExistingWorkspace() {
    roleStorage.clear();
    setExisting(null);
  }

  return (
    <div
      className={
        isCommitting
          ? "wm-auth-stage wm-landing-role-pick wm-landing-role-pick--erDna is-committing"
          : "wm-auth-stage wm-landing-role-pick wm-landing-role-pick--erDna"
      }
      aria-busy={isCommitting || undefined}
    >
      <div className="wm-auth-panel wm-auth-panel--wide wm-auth-panel--erDna">
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
          onSelectRole={isCommitting ? () => undefined : setSelectedRole}
        />

        <button
          type="button"
          className={[
            "wm-press-btn",
            "wm-auth-continue",
            "wm-auth-continue--erDna",
            selectedRole === "employee" ? "wm-auth-continue--candidate" : "wm-auth-continue--hire",
          ].join(" ")}
          onClick={() => goTo(selectedRole)}
          disabled={isCommitting}
        >
          <span className="wm-auth-continue__label">
            {selectedRole === "employer"
              ? "Continue as Employer"
              : selectedRole === "employee"
                ? "Continue as Employee"
                : "Continue"}
          </span>
          <span className="wm-auth-continue__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      <div className="wm-auth-footer wm-auth-footer--erDna">
        <LandingFooterLinks
          supportEmail={SUPPORT_EMAIL}
          privacyPolicyUrl={PRIVACY_POLICY_URL}
          accessHubUrl={ACCESS_HUB_URL}
          variant="enterprise"
        />
      </div>
    </div>
  );
}
