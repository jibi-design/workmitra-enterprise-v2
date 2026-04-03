// src/features/employer/hrManagement/components/NoticeCard.tsx

import type { CompanyNotice } from "../types/companyNotice.types";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type NoticeCardProps = {
  notice: CompanyNotice;
  onDelete: (id: string) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NoticeCard({ notice, onDelete }: NoticeCardProps) {
  const dateStr = new Date(notice.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = new Date(notice.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  const targetLabel = notice.target === "all"
    ? "All Employees"
    : notice.target === "department"
      ? `Department: ${notice.targetValue}`
      : notice.target === "location"
        ? `Location: ${notice.targetValue}`
        : `${notice.recipientCount} specific employee${notice.recipientCount > 1 ? "s" : ""}`;

  return (
    <div style={{
      padding: 14, background: "#fff", borderRadius: 10,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>{notice.title}</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {notice.body}
          </div>
        </div>
        <button type="button" onClick={() => onDelete(notice.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 14, color: "#dc2626", padding: "0 4px", flexShrink: 0,
        }}>×</button>
      </div>
      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: "1px solid var(--wm-er-border, #e5e7eb)",
        display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: "var(--wm-er-muted)",
      }}>
        <span>Sent to: <strong style={{ color: "var(--wm-er-text)" }}>{targetLabel}</strong></span>
        <span>Recipients: <strong style={{ color: "var(--wm-er-text)" }}>{notice.recipientCount}</strong></span>
        <span>{dateStr} at {timeStr}</span>
      </div>
    </div>
  );
}
