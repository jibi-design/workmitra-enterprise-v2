// src/features/employee/home/components/ProfileNudgeCard.tsx
//
// Dashboard nudge: "Complete your profile" card.
// Shows count + missing sections. No progress bar (Master Doc).
// Disappears when profile is 100% complete.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { getProfileCompletion } from "../../profile/services/profileCompletionService";

/* ------------------------------------------------ */
/* Icon                                             */
/* ------------------------------------------------ */
function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ProfileNudgeCard() {
  const nav = useNavigate();
  const status = useMemo(() => getProfileCompletion(), []);

  if (status.isComplete) return null;

  return (
    <section
      style={{
        marginTop: 12, padding: "14px 16px", borderRadius: 14,
        background: "rgba(180,83,9,0.04)",
        border: "1px solid rgba(180,83,9,0.18)",
        borderLeft: "4px solid #b45309",
        cursor: "pointer",
      }}
      role="button"
      tabIndex={0}
      onClick={() => nav(ROUTE_PATHS.employeeProfile)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") nav(ROUTE_PATHS.employeeProfile); }}
      aria-label="Complete your profile"
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(180,83,9,0.10)", color: "#b45309",
        }}>
          <IconProfile />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
            Complete your profile
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted, #6b7280)", marginTop: 2 }}>
            {status.doneCount} of {status.totalCount} sections done
          </div>
        </div>
        <span style={{ color: "var(--wm-er-muted)", fontSize: 16, flexShrink: 0 }}>&#8250;</span>
      </div>

      {/* Missing items */}
      {status.missingLabels.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
          Missing: {status.missingLabels.join(", ")}
        </div>
      )}

      {/* CTA hint */}
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: "#b45309" }}>
        Complete now for better job matches &#8594;
      </div>
    </section>
  );
}