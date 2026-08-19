// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleSelectionPanel.tsx — 2-up square role cards (Employer Home DNA)

import type { ReactElement } from "react";
import type { AppRole } from "../../../app/storage/roleStorage";
import { DomainCard } from "../../../shared/components/layout/designDna";

export type LandingRoleAccent = "hire" | "candidate";

export type LandingRoleCard = {
  role: AppRole;
  title: string;
  desc: string;
  accent: LandingRoleAccent;
  categoryBadge: string;
  Icon: () => ReactElement;
};

type Props = {
  roleCards: LandingRoleCard[];
  selectedRole: AppRole;
  onSelectRole: (role: AppRole) => void;
};

/** Person / career icon for employees */
export function RoleIconEmployee(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c1.6-3.1 3.9-4.5 6.5-4.5s4.9 1.4 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Building / business icon for employers */
export function RoleIconEmployer(): ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3.5" y="8" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 8V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V8"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
    </svg>
  );
}

function RoleSelectCheckIcon(): ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none">
      <path
        d="M2.5 6.2L4.8 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACCENT_TO_DOMAIN = {
  hire: "shift",
  candidate: "career",
} as const;

export function LandingRoleSelectionPanel({ roleCards, selectedRole, onSelectRole }: Props) {
  return (
    <div
      className="wm-auth-bento wm-auth-bento--erDna wm-auth-bento--square"
      role="group"
      aria-label="Choose account role"
    >
      {roleCards.map(({ role, title, desc, accent, categoryBadge, Icon }) => {
        const isSelected = selectedRole === role;
        const domain = ACCENT_TO_DOMAIN[accent];

        return (
          <DomainCard
            key={role}
            domain={domain}
            audience="employer"
            asDiv
            stack
            active={isSelected}
            className={[
              "wm-erExecCard",
              "wm-auth-role-card--erDna",
              "wm-auth-role-card--square",
              `wm-auth-role-card--${accent}`,
              isSelected ? "is-active wm-auth-role-card--selected" : "wm-auth-role-card--idle",
            ]
              .filter(Boolean)
              .join(" ")}
            title={title}
            subtitle={desc}
            ariaLabel={`${categoryBadge}. ${title}. ${desc}. ${isSelected ? "Selected" : "Not selected"}`}
            onClick={() => onSelectRole(role)}
            icon={<Icon />}
            iconStyle={{
              background:
                accent === "hire"
                  ? "color-mix(in srgb, var(--wm-brand-job, #059669) 12%, transparent)"
                  : "color-mix(in srgb, var(--wm-career-accent, #2563eb) 12%, transparent)",
              color:
                accent === "hire"
                  ? "var(--wm-brand-job, #059669)"
                  : "var(--wm-career-accent, #2563eb)",
            }}
            trailing={
              <span
                className={`wm-auth-role-selectMark${isSelected ? " isOn" : ""}`}
                aria-hidden="true"
              >
                {isSelected ? <RoleSelectCheckIcon /> : null}
              </span>
            }
          >
            <span className="wm-auth-role-catBadge" aria-hidden="true">
              {categoryBadge}
            </span>
          </DomainCard>
        );
      })}
    </div>
  );
}
