// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNoticeHistoryCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\bulkNotifications\BulkNoticeHistoryCard.tsx

import type { CompanyNotice } from "../../types/companyNotice.types";
import { NoticeCard } from "../NoticeCard";

type Props = {
  notices: CompanyNotice[];
  displayNotices: CompanyNotice[];
  showAll: boolean;
  onShowAll: () => void;
  onDelete: (id: string) => void;
};

export function BulkNoticeHistoryCard({
  notices,
  displayNotices,
  showAll,
  onShowAll,
  onDelete,
}: Props) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
        marginBottom: 32,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
        Sent Notices ({notices.length})
      </div>

      {notices.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} onDelete={onDelete} />
          ))}

          {notices.length > 5 && !showAll && (
            <button
              type="button"
              onClick={onShowAll}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                color: "var(--wm-er-accent-console)",
                marginTop: 4,
                padding: 0,
              }}
            >
              View all {notices.length} notices
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "var(--wm-er-muted)",
            fontSize: 13,
          }}
        >
          No notices sent yet.
        </div>
      )}
    </div>
  );
}
