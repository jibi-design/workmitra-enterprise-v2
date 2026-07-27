// App name: Job Mitra
// File name: DashboardToggle.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\DashboardToggle.tsx

import { useState } from "react";

type ToggleProps = {
  label: string;
  sub: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function Toggle({ label, sub, value, onChange }: ToggleProps) {
  const [popSaved, setPopSaved] = useState(false);

  function handleToggle() {
    onChange(!value);
    setPopSaved(true);
  }

  function handleAnimationEnd() {
    setPopSaved(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid var(--wm-er-divider)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{label}</div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>{sub}</div>
      </div>

      <button
        type="button"
        className={`wm-press-btn${popSaved ? " wm-popSaved" : ""}`}
        onClick={handleToggle}
        onAnimationEnd={handleAnimationEnd}
        aria-pressed={value}
        style={{
          width: 44,
          height: 24,
          borderRadius: "var(--wm-radius-pill)",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          background: value ? "var(--wm-er-accent-shift)" : "#d1d5db",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 22 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            display: "block",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}
