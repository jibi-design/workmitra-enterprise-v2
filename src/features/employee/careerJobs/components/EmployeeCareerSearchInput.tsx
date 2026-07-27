// App name: Job Mitra
// File name: EmployeeCareerSearchInput.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\EmployeeCareerSearchInput.tsx

export function EmployeeCareerSearchInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: "search" | "location";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon === "search" ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )}
      </span>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          padding: "14px 14px 14px 42px",
          borderRadius: "var(--wm-radius-chip)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          fontSize: 14,
          fontWeight: 600,
          color: "#0f172a",
          outline: "none",
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
          transition: "border-color 0.2s ease",
        }}
      />
    </div>
  );
}
