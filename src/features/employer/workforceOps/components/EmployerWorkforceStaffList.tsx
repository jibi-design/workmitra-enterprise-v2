// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffList.tsx

import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  IconArrowRight,
  IconEmpty,
  IconPlus,
  IconStaff,
  IconStar,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  emptyStateStyle,
  sectionIconWrapStyle,
  sectionTitleStyle,
  staffCardStyle,
  timeAgo,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff[];
  allStaffCount: number;
  searchQuery: string;
  categoryMap: Map<string, string>;
  onOpenStaff: (staffId: string) => void;
  onAddStaff: () => void;
};

function RatingDisplay({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No rating</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 700,
        color: AMBER,
      }}
    >
      <IconStar /> {rating.toFixed(1)}
      <span style={{ fontWeight: 500, color: "var(--wm-er-muted)" }}>({count})</span>
    </span>
  );
}

export function EmployerWorkforceStaffList({
  staff,
  allStaffCount,
  searchQuery,
  categoryMap,
  onOpenStaff,
  onAddStaff,
}: Props) {
  if (staff.length > 0) {
    return (
      <div style={{ marginTop: 14, display: "grid", gap: 10, marginBottom: 24 }}>
        {staff.map((item) => (
          <button
            key={item.id}
            type="button"
            style={staffCardStyle}
            onClick={() => onOpenStaff(item.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
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
                  {item.employeeName}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  ID: {item.employeeUniqueId}
                  {item.employeeCity && ` · ${item.employeeCity}`}
                </div>

                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {item.categories.map((catId) => (
                    <span
                      key={catId}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--wm-radius-pill)",
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

                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}>
                  <RatingDisplay rating={item.rating} count={item.ratingCount} />
                  <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                    Added {timeAgo(item.addedAt)}
                  </span>
                </div>
              </div>

              <div style={{ color: "var(--wm-er-muted)", flexShrink: 0, paddingTop: 4 }}>
                <IconArrowRight />
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (allStaffCount === 0) {
    return (
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={emptyStateStyle}>
          <IconEmpty />
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
            No staff added yet
          </div>

          <div
            style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}
          >
            Add your team members by their unique ID. You can organise them into categories and
            assign work.
          </div>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onAddStaff}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: AMBER,
            }}
          >
            <IconPlus /> Add First Staff
          </button>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--wm-er-border)" }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}>
              <IconStaff />
            </div>
            How to add staff
          </div>

          <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
            {[
              "Get the employee's unique ID (they can find it in their profile)",
              'Tap "Add Staff" and enter their ID',
              "Assign one or more categories to define their role",
              "Staff will be notified and can see your announcements",
            ].map((text, index) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "var(--wm-radius-pill)",
                    background: AMBER_BG,
                    color: AMBER,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ fontSize: 12, color: "var(--wm-er-text)", lineHeight: 1.4 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
      <div style={emptyStateStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
          No staff found
        </div>

        <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 260, lineHeight: 1.5 }}>
          {searchQuery.trim()
            ? `No results for "${searchQuery.trim()}". Try a different search.`
            : "No staff in this category yet."}
        </div>
      </div>
    </div>
  );
}
