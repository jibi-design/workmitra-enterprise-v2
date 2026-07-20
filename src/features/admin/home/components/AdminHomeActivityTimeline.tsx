// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeActivityTimeline.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeActivityTimeline.tsx

import type { AdminHomeActivityItem } from "./AdminHomeSharedUi";
import { Sec } from "./AdminHomeSharedUi";

type Props = {
  activity: AdminHomeActivityItem[];
  showTimeline: boolean;
  onToggleTimeline: () => void;
  onOpenFullAuditLog: () => void;
  formatDate: (timestamp: number) => string;
};

export function AdminHomeActivityTimeline({
  activity,
  showTimeline,
  onToggleTimeline,
  onOpenFullAuditLog,
  formatDate,
}: Props) {
  return (
    <>
      <Sec label="Recent Activity" />

      <div className="wm-ad-timelineCard">
        <button type="button" className="wm-ad-timelineToggle" onClick={onToggleTimeline}>
          <span>Activity Timeline</span>
          <span className="wm-ad-timelineCount">
            {showTimeline ? "Hide" : `Show ${activity.length} events`}
          </span>
        </button>

        {showTimeline && (
          <div style={{ padding: "0 22px 22px" }}>
            {activity.length === 0 ? (
              <div className="wm-ad-empty">
                No activity yet. Events from Shift and Career domains will appear here.
              </div>
            ) : (
              <>
                {activity.map((item, index) => (
                  <TimelineEntry
                    key={item.id}
                    item={item}
                    isLast={index === activity.length - 1}
                    formatDate={formatDate}
                  />
                ))}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={onOpenFullAuditLog}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--wm-ad-navy-300)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    View full audit log
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TimelineEntry({
  item,
  isLast,
  formatDate,
}: {
  item: AdminHomeActivityItem;
  isLast: boolean;
  formatDate: (timestamp: number) => string;
}) {
  const dotColor = item.domain === "shift" ? "var(--wm-ad-shift)" : "var(--wm-ad-career-light)";
  const shadow =
    item.domain === "shift"
      ? "0 0 0 3px var(--wm-ad-shift-dim)"
      : "0 0 0 3px var(--wm-ad-career-dim)";

  return (
    <div className="wm-ad-tlItem">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 16,
          flexShrink: 0,
        }}
      >
        <div className="wm-ad-tlDot" style={{ background: dotColor, boxShadow: shadow }} />
        {!isLast && <div className="wm-ad-tlLine" />}
      </div>

      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
            <span className="wm-ad-tlBadge" data-domain={item.domain}>
              {item.domain === "shift" ? "SHIFT" : "CAREER"}
            </span>

            <span className="wm-ad-tlTitle">{item.title}</span>
          </div>

          <span className="wm-ad-tlTime">{formatDate(item.createdAt)}</span>
        </div>

        {item.body && <div className="wm-ad-tlBody">{item.body}</div>}
      </div>
    </div>
  );
}
