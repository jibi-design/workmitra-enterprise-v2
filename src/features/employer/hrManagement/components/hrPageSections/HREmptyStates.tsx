// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HREmptyStates.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrPageSections\HREmptyStates.tsx

export function NoSearchResults() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        borderRadius: 12,
        border: "1.5px dashed var(--wm-er-border, #e5e7eb)",
        background: "rgba(15, 23, 42, 0.01)",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "rgba(15, 23, 42, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#94a3b8"
            d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </div>

      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #0f172a)" }}>
        No results found
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 6 }}>
        Try a different search term or clear the search.
      </div>
    </div>
  );
}

export function NoTeamMembers() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        borderRadius: 12,
        border: "1.5px dashed var(--wm-er-border, #e5e7eb)",
        background: "rgba(15, 23, 42, 0.01)",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "rgba(124, 58, 237, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#7c3aed"
            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          />
        </svg>
      </div>

      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #0f172a)" }}>
        No team members yet
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 6 }}>
        Candidates who clear interviews will appear here for offer review.
      </div>
    </div>
  );
}
