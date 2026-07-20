// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsEventList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\AdminAlertsEventList.tsx

type AdminAlertEntry = {
  id: string;
  domain: "shift" | "career";
  kind: string;
  title: string;
  body?: string;
  createdAt: number;
  postId: string;
};

type Props = {
  filteredCount: number;
  pageEntries: AdminAlertEntry[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  getKindLabel: (kind: string) => string;
  formatDate: (timestamp: number) => string;
  formatRelativeTime: (timestamp: number) => string;
};

export function AdminAlertsEventList({
  filteredCount,
  pageEntries,
  expandedIds,
  onToggle,
  getKindLabel,
  formatDate,
  formatRelativeTime,
}: Props) {
  return (
    <>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "var(--wm-ad-dim)",
          marginBottom: 10,
          letterSpacing: 0.3,
        }}
      >
        {filteredCount} event{filteredCount !== 1 ? "s" : ""} found
      </div>

      <div className="wm-ad-glass">
        {pageEntries.length === 0 ? (
          <div className="wm-ad-empty">
            No events match your filters. Try adjusting the filters above.
          </div>
        ) : (
          pageEntries.map((entry) => (
            <AuditRow
              key={entry.id}
              entry={entry}
              expanded={expandedIds.has(entry.id)}
              onToggle={() => onToggle(entry.id)}
              getKindLabel={getKindLabel}
              formatDate={formatDate}
              formatRelativeTime={formatRelativeTime}
            />
          ))
        )}
      </div>
    </>
  );
}

function AuditRow({
  entry,
  expanded,
  onToggle,
  getKindLabel,
  formatDate,
  formatRelativeTime,
}: {
  entry: AdminAlertEntry;
  expanded: boolean;
  onToggle: () => void;
  getKindLabel: (kind: string) => string;
  formatDate: (timestamp: number) => string;
  formatRelativeTime: (timestamp: number) => string;
}) {
  return (
    <div className="wm-ad-auditEntry">
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap", flex: 1 }}>
          <span className="wm-ad-tlBadge" data-domain={entry.domain}>
            {entry.domain === "shift" ? "SHIFT" : "CAREER"}
          </span>

          <span className="wm-ad-kindBadge">{getKindLabel(entry.kind)}</span>

          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-ad-text)" }}>
            {entry.title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--wm-ad-dim)",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(entry.createdAt)}
          </span>

          <span
            style={{
              fontSize: 9,
              color: "var(--wm-ad-dim)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {formatRelativeTime(entry.createdAt)}
          </span>
        </div>
      </button>

      {expanded && entry.body && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--wm-ad-muted)",
            lineHeight: 1.6,
            paddingLeft: 2,
            borderLeft: "2px solid var(--wm-ad-border)",
            marginLeft: 2,
            paddingBottom: 2,
          }}
        >
          <div style={{ paddingLeft: 10 }}>{entry.body}</div>
        </div>
      )}
    </div>
  );
}
