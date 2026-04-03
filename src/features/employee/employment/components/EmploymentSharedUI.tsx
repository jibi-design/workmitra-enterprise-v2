// src/features/employee/employment/components/EmploymentSharedUI.tsx
//
// Shared JSX components for Employment Detail page sub-components.

export function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted, var(--wm-er-muted))", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))", textAlign: "right", wordBreak: "break-word" }}>
        {value}
      </span>
    </div>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span style={{ fontSize: 16, letterSpacing: 2 }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}