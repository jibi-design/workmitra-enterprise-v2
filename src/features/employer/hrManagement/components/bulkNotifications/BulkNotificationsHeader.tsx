// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNotificationsHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\bulkNotifications\BulkNotificationsHeader.tsx

type Props = {
  successMessage: string;
};

export function BulkNotificationsHeader({ successMessage }: Props) {
  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(3, 105, 161,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#0369a1"
              d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
            />
          </svg>
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>
            Company Notices
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
            Send notices to all employees, teams, or specific people – no WhatsApp needed
          </div>
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 13,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
}
