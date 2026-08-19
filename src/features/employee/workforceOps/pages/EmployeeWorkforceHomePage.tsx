// src/features/employee/workforceOps/pages/EmployeeWorkforceHomePage.tsx
//
// Workforce Ops Hub â€” Employee Home.
// KPIs, open announcements feed, my active groups, timesheet link, not-added-yet state.

import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import { WorkforceAnnounceFeedCard } from "../components/WorkforceAnnounceFeedCard";
import {
  IconGroup,
  IconAnnounce,
  IconEmpty,
  IconArrowRight,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  sectionTitleStyle,
  sectionIconWrapStyle,
  listRowBtnStyle,
  emptyStateStyle,
  stepCircleStyle,
  statusBadgeStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Component                                                                  */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function EmployeeWorkforceHomePage() {
  const summary = useMemo(() => employeeWorkforceHelpers.getHomeSummary(), []);
  const announcements = useMemo(() => employeeWorkforceHelpers.getVisibleAnnouncements(), []);
  const myGroups = useMemo(() => employeeWorkforceHelpers.getMyActiveGroups(), []);
  const categories = useMemo(() => employeeWorkforceHelpers.getAllCategories(), []);
  const myApplications = useMemo(() => employeeWorkforceHelpers.getMyApplications(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const nav = useNavigate();
  const navTo = useCallback(
    (path: string) => {
      nav(path);
    },
    [nav],
  );

  /* â”€â”€ Not added as staff â”€â”€ */
  if (!summary.isStaff) {
    return (
      <div className="wm-ee-vWorkforce" style={{ padding: "0 16px" }}>
        <DomainHero
          variant="workforce"
          audience="employee"
          icon={<WorkforceHubIcon />}
          title="Workforce Ops Hub"
          subtitle="Your staff dashboard"
          description="When an employer adds you with your unique ID, announcements and groups appear here."
        />

        <div className="wm-er-card" style={{ marginTop: 14 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
              You're not added to any company yet
            </div>
            <div
              style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 300, lineHeight: 1.5 }}
            >
              When an employer adds you to their staff directory using your unique ID, their
              announcements and work groups will appear here.
            </div>
          </div>
        </div>

        {/* How it works for employees */}
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
            How it works
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {[
              "Share your unique ID with employers you want to work with",
              "Once added, you'll see their announcements here",
              "Mark your availability for shifts that suit you",
              "Get confirmed and join Work Groups with your team",
              "Sign in/out for attendance and build your rating",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={stepCircleStyle}>{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--wm-er-text)" }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-ee-vWorkforce" style={{ padding: "0 16px" }}>
      <DomainHero
        variant="workforce"
        audience="employee"
        icon={<WorkforceHubIcon />}
        title="Workforce Ops Hub"
        subtitle="Your staff dashboard"
        description="Open announcements, active groups, and timesheet access in one place."
      >
        <div className="wm-er-tiles">
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Open</div>
            <div
              className="wm-er-tileValue"
              style={{ color: summary.openAnnouncements > 0 ? AMBER : undefined }}
            >
              {summary.openAnnouncements}
            </div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Applied</div>
            <div className="wm-er-tileValue">{summary.myApplications}</div>
          </div>
          <div className="wm-er-tile">
            <div className="wm-er-tileLabel">Groups</div>
            <div
              className="wm-er-tileValue"
              style={{ color: summary.activeGroups > 0 ? "var(--wm-success)" : undefined }}
            >
              {summary.activeGroups}
            </div>
          </div>
        </div>
      </DomainHero>

      {/* â”€â”€ My Timesheet Link â”€â”€ */}
      <button
        type="button"
        style={{
          width: "100%",
          marginTop: 14,
          padding: "14px",
          borderRadius: "var(--wm-radius-14)",
          border: `1px solid ${AMBER}`,
          background: AMBER_BG,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => navTo("/employee/workforce/timesheet")}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: AMBER }}>My Timesheet</div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            View monthly hours, days worked, and attendance history
          </div>
        </div>
        <span style={{ color: AMBER, fontSize: 18 }}>â†’</span>
      </button>

      {/* â”€â”€ My Active Groups â”€â”€ */}
      {myGroups.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}>
              <IconGroup />
            </div>
            My Active Groups
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {myGroups.map(({ group, member }) => (
              <button
                key={group.id}
                type="button"
                style={listRowBtnStyle}
                onClick={() => navTo(`/employee/workforce/group/${group.id}`)}
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
                    {group.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {group.date} · {member.assignedShiftIds.length} shift
                    {member.assignedShiftIds.length !== 1 ? "s" : ""}
                    {group.location && ` · ${group.location}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ ...statusBadgeStyle, color: "var(--wm-success)" }}>Active</span>
                  <span style={{ color: "var(--wm-er-muted)" }}>
                    <IconArrowRight />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ Open Announcements Feed â”€â”€ */}
      <div style={{ marginTop: 14 }}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconWrapStyle}>
            <IconAnnounce />
          </div>
          Open Announcements
        </div>

        {announcements.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {announcements.map((ann) => {
              const catNames = ann.targetCategories
                .map((id) => categoryMap.get(id) ?? id)
                .slice(0, 3);
              const applied = myApplications.some((a) => a.announcementId === ann.id);

              return (
                <WorkforceAnnounceFeedCard
                  key={ann.id}
                  announcement={ann}
                  categoryNames={catNames}
                  hasApplied={applied}
                  isPreferredCompany={false}
                  onClick={() => navTo(`/employee/workforce/announce/${ann.id}`)}
                />
              );
            })}
          </div>
        ) : (
          <div className="wm-er-card">
            <div style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--wm-er-muted)" }}>
                No open announcements right now. Check back later.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ My Categories â”€â”€ */}
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}>
          My Categories
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {employeeWorkforceHelpers.getMyCategoryNames().map((name, i) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--wm-radius-pill)",
                background: AMBER_BG,
                color: AMBER,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkforceHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}
