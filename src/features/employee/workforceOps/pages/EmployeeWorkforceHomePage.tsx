// src/features/employee/workforceOps/pages/EmployeeWorkforceHomePage.tsx
//
// Workforce Ops Hub — Employee Home.
// KPIs, open announcements feed, my active groups, timesheet link, not-added-yet state.

import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import { WorkforceAnnounceFeedCard } from "../components/WorkforceAnnounceFeedCard";
import {
  IconGroup,
  IconAnnounce,
  IconEmpty,
  IconArrowRight,
} from "../../../employer/workforceOps/components/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  sectionTitleStyle,
  sectionIconWrapStyle,
  listRowBtnStyle,
  emptyStateStyle,
  stepCircleStyle,
  statusBadgeStyle,
} from "../../../employer/workforceOps/components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

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
  const navTo = useCallback((path: string) => { nav(path); }, [nav]);

  /* ── Not added as staff ── */
  if (!summary.isStaff) {
    return (
      <div className="wm-ee-vWorkforce" style={{ padding: "0 16px" }}>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Workforce Ops Hub</div>
            <div className="wm-pageSub">Your staff dashboard</div>
          </div>
        </div>

        <div className="wm-er-card" style={{ marginTop: 14 }}>
          <div style={emptyStateStyle}>
            <IconEmpty />
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
              You're not added to any company yet
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 300, lineHeight: 1.5 }}>
              When an employer adds you to their staff directory using your unique ID, their announcements and work groups will appear here.
            </div>
          </div>
        </div>

        {/* How it works for employees */}
        <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>How it works</div>
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
      {/* ── Header ── */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Workforce Ops Hub</div>
          <div className="wm-pageSub">Your staff dashboard</div>
        </div>
      </div>

      {/* ── KPI Tiles ── */}
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Open</div>
          <div className="wm-er-tileValue" style={{ color: summary.openAnnouncements > 0 ? AMBER : undefined }}>
            {summary.openAnnouncements}
          </div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Applied</div>
          <div className="wm-er-tileValue">{summary.myApplications}</div>
        </div>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Groups</div>
          <div className="wm-er-tileValue" style={{ color: summary.activeGroups > 0 ? "var(--wm-success)" : undefined }}>
            {summary.activeGroups}
          </div>
        </div>
      </div>

      {/* ── My Timesheet Link ── */}
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
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>View monthly hours, days worked, and attendance history</div>
        </div>
        <span style={{ color: AMBER, fontSize: 18 }}>→</span>
      </button>

      {/* ── My Active Groups ── */}
      {myGroups.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}><IconGroup /></div>
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {group.date} · {member.assignedShiftIds.length} shift{member.assignedShiftIds.length !== 1 ? "s" : ""}
                    {group.location && ` · ${group.location}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ ...statusBadgeStyle, color: "var(--wm-success)" }}>Active</span>
                  <span style={{ color: "var(--wm-er-muted)" }}><IconArrowRight /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Open Announcements Feed ── */}
      <div style={{ marginTop: 14 }}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconWrapStyle}><IconAnnounce /></div>
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

      {/* ── My Categories ── */}
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}>My Categories</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {employeeWorkforceHelpers.getMyCategoryNames().map((name, i) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
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