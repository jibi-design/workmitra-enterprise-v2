// src/features/employer/hrManagement/components/HRSearchBar.tsx
//
// Search bar for HR Management page.
// Searches by employee name, unique ID, department, or job title.
// 10/10 polish: taller, stronger presence, smooth focus ring.

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#94a3b8"
        d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>
  );
}

function IconClear() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#94a3b8"
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    </svg>
  );
}

export function HRSearchBar({ value, onChange }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconSearch />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, ID, or department..."
        style={{
          width: "100%",
          height: 44,
          borderRadius: 12,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          padding: "0 40px 0 40px",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--wm-er-text, #0f172a)",
          background: "#fff",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--wm-er-accent-hr, #7c3aed)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--wm-er-border, #e5e7eb)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {/* Filter icon (visual indicator — enterprise feel) */}
      {value.length === 0 && (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "rgba(15, 23, 42, 0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#b0b5bf" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
          </svg>
        </div>
      )}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 26,
            height: 26,
            borderRadius: 8,
            border: "none",
            background: "rgba(15, 23, 42, 0.05)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <IconClear />
        </button>
      )}
    </div>
  );
}
