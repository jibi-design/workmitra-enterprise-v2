import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconArrowRight, IconEmpty } from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  emptyStateStyle,
  listRowBtnStyle,
  sectionIconWrapStyle,
  sectionTitleStyle,
  statusBadgeStyle,
  timeAgo,
} from "../../../../shared/domains/workforce/ui/workforceStyles";
import { IconGroup } from "../../../../shared/domains/workforce/ui/workforceIcons";

type GroupListProps = {
  groups: WorkforceGroup[];
  memberCounts: Map<string, number>;
  tab: "active" | "completed";
  onOpenGroup: (groupId: string) => void;
};

export function WorkforceGroupList({ groups, memberCounts, tab, onOpenGroup }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="wm-er-card" style={{ marginTop: 14, marginBottom: 24 }}>
        <div style={emptyStateStyle}>
          <IconEmpty />
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
            {tab === "active" ? "No active groups" : "No completed groups"}
          </div>
          <div
            style={{ fontSize: 13, color: "var(--wm-er-muted)", maxWidth: 280, lineHeight: 1.5 }}
          >
            {tab === "active"
              ? "Groups are created automatically when you confirm an announcement, or you can create a quick group from the home page."
              : "Completed groups will appear here after they are marked as done."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 10, marginBottom: 24 }}>
      {groups.map((group) => {
        const members = memberCounts.get(group.id) ?? 0;
        return (
          <button
            key={group.id}
            type="button"
            style={listRowBtnStyle}
            onClick={() => onOpenGroup(group.id)}
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
                  {group.name}
                </div>
                {group.groupType === "quick" && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: "var(--wm-radius-pill)",
                      background: AMBER_BG,
                      color: AMBER,
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    QUICK
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                {new Date(group.date + "T00:00:00").toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {members} member{members !== 1 ? "s" : ""} · {group.shifts.length} shift
                {group.shifts.length !== 1 ? "s" : ""}
                {group.location && ` · ${group.location}`}
              </div>
              <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                Created {timeAgo(group.createdAt)}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span
                style={{
                  ...statusBadgeStyle,
                  color: group.status === "active" ? "var(--wm-success)" : "var(--wm-er-muted)",
                }}
              >
                {group.status === "active" ? "Active" : "Completed"}
              </span>
              <span style={{ color: "var(--wm-er-muted)" }}>
                <IconArrowRight />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function WorkforceGroupsHowItWorks() {
  return (
    <div className="wm-er-card" style={{ marginBottom: 24 }}>
      <div style={sectionTitleStyle}>
        <div style={sectionIconWrapStyle}>
          <IconGroup />
        </div>
        How groups work
      </div>
      <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
        {[
          "Create an announcement and confirm your selected staff",
          "A Work Group is created automatically with all confirmed members",
          "Communicate with your team, track attendance, and manage shifts",
          "After the work is done, rate your team and mark as completed",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
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
              {i + 1}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-text)", lineHeight: 1.4 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
