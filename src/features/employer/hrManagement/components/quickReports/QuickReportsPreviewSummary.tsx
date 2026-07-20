// App: Job Mitra / WorkMitra_Enterprise_v2
// File: QuickReportsPreviewSummary.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\quickReports\QuickReportsPreviewSummary.tsx

type PreviewSummary = {
  daysPresent: number;
  daysAbsent: number;
  daysLeave: number;
  daysOff: number;
  totalHours: number;
};

type Props = {
  previewSummary: PreviewSummary | null;
  canGenerate: boolean;
};

export function QuickReportsPreviewSummary({ previewSummary, canGenerate }: Props) {
  if (!previewSummary || !canGenerate) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 11,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        Preview
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <SummaryItem label="Present" value={previewSummary.daysPresent} color="#15803d" />
        <SummaryItem label="Absent" value={previewSummary.daysAbsent} color="#dc2626" />
        <SummaryItem label="Leave" value={previewSummary.daysLeave} color="#d97706" />
        <SummaryItem
          label="Hours"
          value={`${previewSummary.totalHours}h`}
          color="var(--wm-er-text)"
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
      <span style={{ color: "var(--wm-er-muted)" }}>{label}:</span>
      <span style={{ fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
