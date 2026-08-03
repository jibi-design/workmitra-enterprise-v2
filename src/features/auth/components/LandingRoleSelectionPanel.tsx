// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleSelectionPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingRoleSelectionPanel.tsx

import type { KeyboardEvent, ReactElement } from "react";
import type { AppRole } from "../../../app/storage/roleStorage";

export type LandingRoleCard = {
  role: AppRole;
  title: string;
  desc: string;
  accent: string;
  Icon: () => ReactElement;
};

type Props = {
  roleCards: LandingRoleCard[];
  selectedRole: AppRole;
  onSelectRole: (role: AppRole) => void;
};

function onCardKeyDown(event: KeyboardEvent<HTMLButtonElement>, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

export function RoleIconEmployee(): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5Z"
      />
    </svg>
  );
}

export function RoleIconEmployer(): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 21V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12H3Zm2-2h14V9H5v10Zm3-12V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h-2V5h-4v2H8Z"
      />
    </svg>
  );
}

export function LandingRoleSelectionPanel({ roleCards, selectedRole, onSelectRole }: Props) {
  return (
    <div className="wm-auth-bento" role="group" aria-label="Choose account role">
      {roleCards.map(({ role, title, desc, Icon }, index) => {
        const isSelected = selectedRole === role;

        return (
          <button
            key={role}
            type="button"
            className={`wm-press-card wm-animateScaleIn wm-auth-role-card${
              isSelected ? " wm-auth-role-card--selected" : ""
            }`}
            style={{ animationDelay: `${index * 90}ms` }}
            onClick={() => onSelectRole(role)}
            onKeyDown={(event) => onCardKeyDown(event, () => onSelectRole(role))}
            aria-pressed={isSelected}
          >
            <span className="wm-auth-role-card__icon" aria-hidden="true">
              <Icon />
            </span>

            <div className="wm-auth-role-card__copy">
              <span className="wm-auth-role-card__title">{title}</span>
              <span className="wm-auth-role-card__desc">{desc}</span>
            </div>

            <span className="wm-auth-role-card__radio" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
