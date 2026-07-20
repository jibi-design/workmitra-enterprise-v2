// App: Job Mitra / WorkMitra_Enterprise_v2
// File: contractRenewalUi.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\contractRenewal\contractRenewalUi.tsx

import { useState } from "react";

export function ContractProgressBar({
  startDate,
  endDate,
}: {
  startDate: number;
  endDate: number;
}) {
  const [now] = useState(() => Date.now());
  const total = endDate - startDate;
  const elapsed = now - startDate;
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
  const color = pct >= 90 ? "#dc2626" : pct >= 75 ? "#d97706" : "#16a34a";

  return (
    <div
      style={{
        background: "var(--wm-er-bg, #f1f5f9)",
        borderRadius: 4,
        height: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>{value}</span>
    </div>
  );
}

export function FieldLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: "var(--wm-er-muted)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
      }}
    >
      {text}
    </div>
  );
}
