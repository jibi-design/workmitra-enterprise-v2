// App name: Job Mitra
// File name: CandidateStatusPills.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\CandidateStatusPills.tsx

export function CandidateStatusPill({ text }: { text: string }) {
  return (
    <span
      style={{
        marginLeft: 8,
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid var(--wm-er-border)",
        background: "#f9fafb",
        color: "var(--wm-er-muted)",
      }}
    >
      {text}
    </span>
  );
}

export function CandidateAnswerPill({ label, answer }: { label: string; answer: "yes" | "no" }) {
  const isYes = answer === "yes";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        background: isYes ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
        color: isYes ? "#16a34a" : "#dc2626",
        border: `1px solid ${isYes ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
      }}
    >
      <span style={{ fontSize: 9 }}>{isYes ? "Yes" : "No"}</span>
      {label}
    </span>
  );
}
