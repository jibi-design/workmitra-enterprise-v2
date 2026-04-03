// src/features/employee/workforceOps/pages/EmployeeWorkforceCompanyPage.tsx
//
// Workforce Ops Hub — Employee Company View.
// Shows announcements and groups from a specific company/employer.
// Phase-0: since we have single employer, this shows all data.

import { useMemo } from "react";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import { WorkforceAnnounceFeedCard } from "../components/WorkforceAnnounceFeedCard";
import { IconBack, IconGroup, IconAnnounce, IconArrowRight } from "../../../employer/workforceOps/components/workforceIcons";
import {
  AMBER,
  sectionTitleStyle,
  sectionIconWrapStyle,
  listRowBtnStyle,
  statusBadgeStyle,
  timeAgo,
} from "../../../employer/workforceOps/components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  onBack: () => void;
  onOpenAnnouncement: (announcementId: string) => void;
  onOpenGroup: (groupId: string) => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployeeWorkforceCompanyPage({ onBack, onOpenAnnouncement, onOpenGroup }: Props) {
  const staff = useMemo(() => employeeWorkforceHelpers.getMyStaffRecord(), []);
  const announcements = useMemo(() => employeeWorkforceHelpers.getAllAnnouncementsForMe(), []);
  const myGroups = useMemo(() => employeeWorkforceHelpers.getMyGroups(), []);
  const myApps = useMemo(() => employeeWorkforceHelpers.getMyApplications(), []);
  const categories = useMemo(() => employeeWorkforceHelpers.getAllCategories(), []);
  const categoryNames = useMemo(() => employeeWorkforceHelpers.getMyCategoryNames(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const openAnnouncements = useMemo(() => announcements.filter((a) => a.status === "open"), [announcements]);
  const pastAnnouncements = useMemo(() => announcements.filter((a) => a.status !== "open"), [announcements]);

  if (!staff) {
    return (
      <div style={{ padding: "0 16px" }}>
        <div className="wm-pageHead">
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4 }}><IconBack /></button>
          <div className="wm-pageTitle">Not added as staff</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Header */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">My Company</div>
          <div className="wm-pageSub">{categoryNames.join(", ")}</div>
        </div>
      </div>

      {/* Staff Info */}
      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{staff.employeeName}</div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          ID: {staff.employeeUniqueId}
          {staff.employeeCity && ` · ${staff.employeeCity}`}
        </div>
        {staff.rating !== null && (
          <div style={{ marginTop: 4, fontSize: 12, color: AMBER, fontWeight: 700 }}>
            ★ {staff.rating.toFixed(1)} ({staff.ratingCount} rating{staff.ratingCount !== 1 ? "s" : ""})
          </div>
        )}
      </div>

      {/* Open Announcements */}
      <div style={{ marginTop: 14 }}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconWrapStyle}><IconAnnounce /></div>
          Open Announcements ({openAnnouncements.length})
        </div>
        {openAnnouncements.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {openAnnouncements.map((ann) => {
              const catNames = ann.targetCategories.map((id) => categoryMap.get(id) ?? id).slice(0, 3);
              const applied = myApps.some((a) => a.announcementId === ann.id);
              return (
                <WorkforceAnnounceFeedCard
                  key={ann.id}
                  announcement={ann}
                  categoryNames={catNames}
                  hasApplied={applied}
                  isPreferredCompany={false}
                  onClick={() => onOpenAnnouncement(ann.id)}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: 12, textAlign: "center" }}>
            No open announcements right now
          </div>
        )}
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={sectionTitleStyle}>
            <div style={sectionIconWrapStyle}><IconGroup /></div>
            My Groups ({myGroups.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {myGroups.map(({ group }) => (
              <button
                key={group.id}
                type="button"
                style={listRowBtnStyle}
                onClick={() => onOpenGroup(group.id)}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                    {new Date(group.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Created {timeAgo(group.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ ...statusBadgeStyle, color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)" }}>
                    {group.status === "active" ? "Active" : "Done"}
                  </span>
                  <span style={{ color: "var(--wm-er-muted)" }}><IconArrowRight /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Past Announcements */}
      {pastAnnouncements.length > 0 && (
        <div style={{ marginTop: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-muted)", marginBottom: 8 }}>
            Past Announcements ({pastAnnouncements.length})
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {pastAnnouncements.slice(0, 5).map((ann) => (
              <div key={ann.id} style={{ padding: "8px 12px", borderRadius: "var(--wm-radius-10)", background: "var(--wm-er-bg)", opacity: 0.7 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>{ann.title}</div>
                <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {new Date(ann.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · {ann.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}