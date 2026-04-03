// src/features/employer/workforceOps/components/WorkforceStaffCard.tsx
//
// Reusable staff card for Workforce Ops Hub.
// Displays staff info in a clickable card format.

import { useMemo } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceStaff } from "../types/workforceTypes";
import { IconStar, IconArrowRight } from "./workforceIcons";
import { RatingPendingBadge } from "../../../../shared/components/RatingPendingBadge";
import { AMBER, AMBER_BG, staffCardStyle, timeAgo } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  staff: WorkforceStaff;
  onClick?: () => void;
  showArrow?: boolean;
  showCategories?: boolean;
  showRating?: boolean;
  showAddedTime?: boolean;
  compact?: boolean;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function WorkforceStaffCard({
  staff,
  onClick,
  showArrow = true,
  showCategories = true,
  showRating = true,
  showAddedTime = true,
  compact = false,
}: Props) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const cardPadding = compact ? "10px 12px" : "14px";

  return (
    <button
      type="button"
      style={{ ...staffCardStyle, padding: cardPadding, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        {/* Left: Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Name */}
          <div
            style={{
              fontSize: compact ? 13 : 14,
              fontWeight: 700,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {staff.employeeName}
          </div>

          {/* ID + City */}
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            ID: {staff.employeeUniqueId}
            {staff.employeeCity && ` · ${staff.employeeCity}`}
          </div>

          {/* Category chips */}
          {showCategories && staff.categories.length > 0 && (
            <div style={{ marginTop: compact ? 4 : 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {staff.categories.map((catId) => (
                <span
                  key={catId}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: AMBER_BG,
                    color: AMBER,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {categoryMap.get(catId) ?? catId}
                </span>
              ))}
            </div>
          )}

          {/* Rating + Added time */}
          {(showRating || showAddedTime) && (
            <div style={{ marginTop: compact ? 4 : 6, display: "flex", alignItems: "center", gap: 10 }}>
              {showRating && (
                staff.rating !== null && staff.ratingCount > 0 ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: AMBER }}>
                    <IconStar /> {staff.rating.toFixed(1)}
                    <span style={{ fontWeight: 500, color: "var(--wm-er-muted)" }}>({staff.ratingCount})</span>
                  </span>
                ) : (
                  <RatingPendingBadge accentColor={AMBER} />
                )
              )}
              {showAddedTime && (
                <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                  Added {timeAgo(staff.addedAt)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Arrow */}
        {showArrow && onClick && (
          <div style={{ color: "var(--wm-er-muted)", flexShrink: 0, paddingTop: 4 }}>
            <IconArrowRight />
          </div>
        )}
      </div>
    </button>
  );
}