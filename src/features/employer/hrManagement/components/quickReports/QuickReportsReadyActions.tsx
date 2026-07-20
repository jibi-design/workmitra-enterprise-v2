// App: Job Mitra / WorkMitra_Enterprise_v2
// File: QuickReportsReadyActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\quickReports\QuickReportsReadyActions.tsx

type Props = {
  isReady: boolean;
  onDownload: () => void;
  onShareEmail: () => void;
  onShareWhatsApp: () => void;
};

export function QuickReportsReadyActions({
  isReady,
  onDownload,
  onShareEmail,
  onShareWhatsApp,
}: Props) {
  if (!isReady) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        background: "#f0fdf4",
        borderRadius: 10,
        border: "1px solid #bbf7d0",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: "#15803d", marginBottom: 10 }}>
        Report Ready
      </div>

      <button
        type="button"
        onClick={onDownload}
        style={{
          width: "100%",
          padding: "10px 0",
          border: "1px solid #15803d",
          borderRadius: 8,
          background: "#fff",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 800,
          color: "#15803d",
        }}
      >
        Download PDF
      </button>

      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          type="button"
          onClick={onShareEmail}
          style={{
            padding: "9px 0",
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-er-text)",
          }}
        >
          Share via Email
        </button>

        <button
          type="button"
          onClick={onShareWhatsApp}
          style={{
            padding: "9px 0",
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "#25d366",
          }}
        >
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}
