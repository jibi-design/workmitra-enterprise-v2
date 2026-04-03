// src/features/employer/hrManagement/components/exitClearanceHelpers.tsx

/* ------------------------------------------------ */
/* Info Row                                         */
/* ------------------------------------------------ */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Preview Row                                      */
/* ------------------------------------------------ */
export function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 1, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Field Label                                      */
/* ------------------------------------------------ */
export function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
      {text}
    </div>
  );
}