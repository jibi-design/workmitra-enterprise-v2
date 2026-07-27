// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AntiFraudNotice.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employerProfile\AntiFraudNotice.tsx

type Props = {
  mlId?: string;
};

export function AntiFraudNotice({ mlId = "" }: Props) {
  if (!mlId) return null;

  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 10,
        background: "rgba(100,116,139,0.06)",
        border: "1px solid rgba(100,116,139,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true">
        <path
          fill="#64748b"
          d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Zm-1 15h2v2h-2v-2Zm0-8h2v6h-2V9Z"
        />
      </svg>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Your Mitra Labs ID{" "}
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            color: "var(--wm-er-text)",
            letterSpacing: 0.3,
          }}
        >
          {mlId}
        </span>{" "}
        will be visible to all applicants.
      </div>
    </div>
  );
}
