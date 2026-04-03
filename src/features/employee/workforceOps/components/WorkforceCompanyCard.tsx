// src/features/employee/workforceOps/components/WorkforceCompanyCard.tsx
//
// Reusable company card for Employee Workforce Home.

import type { WorkforceStaff } from "../../../employer/workforceOps/types/workforceTypes";
import {
  IconStar,
  IconArrowRight,
} from "../../../employer/workforceOps/components/workforceIcons";
import {
  AMBER,
} from "../../../employer/workforceOps/components/workforceStyles";

type Props = {
  staff: WorkforceStaff;
  categoryNames: string[];
  openAnnouncements: number;
  activeGroups: number;
  isPreferred: boolean;
  onTogglePreferred: () => void;
  onClick: () => void;
};

export function WorkforceCompanyCard({
  staff,
  categoryNames,
  openAnnouncements,
  activeGroups,
  isPreferred,
  onTogglePreferred,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "var(--wm-radius-14)",
        border: isPreferred ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
        background: "var(--wm-er-card)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {staff.employeeName}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {categoryNames.join(", ") || "No categories"}
          </div>

          {/* Stats */}
          <div style={{ marginTop: 6, display: "flex", gap: 10, fontSize: 11 }}>
            {staff.rating !== null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: AMBER, fontWeight: 700 }}>
                <IconStar /> {staff.rating.toFixed(1)}
              </span>
            )}
            {openAnnouncements > 0 && (
              <span style={{ color: "var(--wm-success)", fontWeight: 700 }}>
                {openAnnouncements} open
              </span>
            )}
            {activeGroups > 0 && (
              <span style={{ color: AMBER, fontWeight: 700 }}>
                {activeGroups} group{activeGroups !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Preferred Star */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTogglePreferred(); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isPreferred ? AMBER : "var(--wm-er-border)",
              fontSize: 18,
              padding: 2,
            }}
            aria-label={isPreferred ? "Remove from preferred" : "Add to preferred"}
          >
            ★
          </button>
          <span style={{ color: "var(--wm-er-muted)" }}><IconArrowRight /></span>
        </div>
      </div>
    </button>
  );
}