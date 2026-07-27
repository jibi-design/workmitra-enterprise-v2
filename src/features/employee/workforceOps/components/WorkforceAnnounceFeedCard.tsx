// src/features/employee/workforceOps/components/WorkforceAnnounceFeedCard.tsx
//
// Reusable announcement card for Employee Workforce feed.

import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconArrowRight } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  categoryNames: string[];
  hasApplied: boolean;
  isPreferredCompany: boolean;
  onClick: () => void;
};

export function WorkforceAnnounceFeedCard({
  announcement,
  categoryNames,
  hasApplied,
  isPreferredCompany,
  onClick,
}: Props) {
  const totalVacancy = (() => {
    let total = 0;
    for (const catId of announcement.targetCategories) {
      const shiftMap = announcement.vacancyPerCategoryPerShift[catId];
      if (!shiftMap) continue;
      for (const shift of announcement.shifts) {
        total += shiftMap[shift.id] ?? 0;
      }
    }
    return total;
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "var(--wm-radius-14)",
        border: isPreferredCompany ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
        background: "var(--wm-er-card)",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {announcement.title}
          </div>
          {isPreferredCompany && <span style={{ color: AMBER, fontSize: 12 }}>â˜…</span>}
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
          {new Date(announcement.date + "T00:00:00").toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          Â· {announcement.shifts.length} shift{announcement.shifts.length !== 1 ? "s" : ""} Â·{" "}
          {totalVacancy} {totalVacancy === 1 ? "vacancy" : "vacancies"}
        </div>

        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {categoryNames.map((name, i) => (
            <span
              key={i}
              style={{
                padding: "2px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: AMBER_BG,
                color: AMBER,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {name}
            </span>
          ))}
        </div>

        {hasApplied && (
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: "var(--wm-success)" }}>
            âœ“ Applied
          </div>
        )}
      </div>

      <span style={{ color: "var(--wm-er-muted)", flexShrink: 0 }}>
        <IconArrowRight />
      </span>
    </button>
  );
}
