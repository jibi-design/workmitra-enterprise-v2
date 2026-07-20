// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LandingRoleSelectionPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\auth\components\LandingRoleSelectionPanel.tsx

import type { CSSProperties, KeyboardEvent, ReactElement } from "react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {roleCards.map(({ role, title, desc, accent, Icon }, index) => {
        const isSelected = selectedRole === role;

        const cardStyle: CSSProperties = {
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12 /* Tighter gap to give text space */,
          width: "100%",
          padding: "16px 12px" /* Reduced horizontal padding */,
          borderRadius: 14,
          /* Subtle Blue Tint for Selected State */
          background: isSelected ? "rgba(37, 99, 235, 0.02)" : "#FFFFFF",
          border: isSelected ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
          boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.06)" : "none",
          textAlign: "left",
          cursor: "pointer",
          animationDelay: `${index * 90}ms`,
        };

        const iconWrapStyle: CSSProperties = {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38 /* Slightly smaller icon box to give text more room */,
          height: 38,
          borderRadius: 10,
          background: isSelected ? "#FFFFFF" : "#F1F5F9",
          border: isSelected ? "1px solid rgba(15,23,42,0.08)" : "none",
          color: isSelected ? accent : "#64748B",
          flexShrink: 0,
        };

        return (
          <button
            key={role}
            type="button"
            className="wm-press-card wm-animateScaleIn"
            style={cardStyle}
            onClick={() => onSelectRole(role)}
            onKeyDown={(event) => onCardKeyDown(event, () => onSelectRole(role))}
            aria-pressed={isSelected}
          >
            <span style={iconWrapStyle} aria-hidden="true">
              <Icon />
            </span>

            <div
              style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, paddingRight: 6 }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </span>
              {/* Size reduced to 12.5px for perfect responsive fitting */}
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 400,
                  color: "#64748B",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                }}
              >
                {desc}
              </span>
            </div>

            {/* Ultra-Premium Radio Indicator */}
            <div
              style={{
                marginLeft: "auto",
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: isSelected ? "5.5px solid #2563EB" : "1px solid #CBD5E1",
                background: "#FFFFFF",
                boxShadow: isSelected
                  ? "0 2px 6px rgba(37, 99, 235, 0.2)"
                  : "inset 0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
