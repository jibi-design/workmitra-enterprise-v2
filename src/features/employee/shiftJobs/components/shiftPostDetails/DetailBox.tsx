// App name: Job Mitra
// File name: DetailBox.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\DetailBox.tsx

export function DetailBox({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div
      style={{
        padding: "10px 10px",
        borderRadius: 14,
        background: "rgba(248,250,252,0.96)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 850,
          color: "var(--wm-er-text)",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
