// App name: Job Mitra | DetailBox.tsx — glass meta tile (post-details polish)

export function DetailBox({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="wm-shift-surface-glass" style={{ padding: "10px 10px", minWidth: 0 }}>
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
