// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessSessionTimer.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessSessionTimer.tsx

import { useEffect, useState } from "react";
import { DOC_ACCESS_ACCENT } from "../docAccessConstants";
import { docAccessSessionStorage } from "../docAccessSessionStorage";

export function DocAccessSessionTimer() {
  const [remainingMs, setRemainingMs] = useState(() => docAccessSessionStorage.getRemainingMs());

  useEffect(() => {
    const timer = window.setInterval(
      () => setRemainingMs(docAccessSessionStorage.getRemainingMs()),
      1000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLow = totalSeconds <= 120;

  if (remainingMs <= 0) {
    return <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>Session expired</span>;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        background: isLow ? "rgba(220,38,38,0.08)" : "rgba(124,58,237,0.08)",
        border: `1px solid ${isLow ? "rgba(220,38,38,0.2)" : "rgba(124,58,237,0.2)"}`,
      }}
    >
      <ClockIcon color={isLow ? "#dc2626" : DOC_ACCESS_ACCENT} />

      <span style={{ fontSize: 12, fontWeight: 700, color: isLow ? "#dc2626" : DOC_ACCESS_ACCENT }}>
        {minutes}:{String(seconds).padStart(2, "0")} remaining
      </span>
    </div>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z"
      />
    </svg>
  );
}
