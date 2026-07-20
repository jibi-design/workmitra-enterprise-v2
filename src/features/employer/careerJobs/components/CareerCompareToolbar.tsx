// App name: Job Mitra
// File name: CareerCompareToolbar.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCompareToolbar.tsx

type CareerCompareToolbarProps = {
  compareMode: boolean;
  selectedCount: number;
  onStartCompare: () => void;
  onCancelCompare: () => void;
  onOpenCompare: () => void;
};

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export function CareerCompareToolbar({
  compareMode,
  selectedCount,
  onStartCompare,
  onCancelCompare,
  onOpenCompare,
}: CareerCompareToolbarProps) {
  if (!compareMode) {
    return (
      <div
        style={{
          padding: "11px 12px",
          borderRadius: 20,
          border: "1px solid rgba(29,78,216,0.12)",
          background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
          boxShadow: "0 10px 22px rgba(15,23,42,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 950, color: CAREER_TEXT }}>
            Compare candidates
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 11.5,
              fontWeight: 750,
              color: CAREER_MUTED,
              lineHeight: 1.4,
            }}
          >
            Select 2 or 3 candidates for side-by-side review.
          </div>
        </div>

        <button
          type="button"
          onClick={onStartCompare}
          style={{
            flexShrink: 0,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(29,78,216,0.18)",
            background: "rgba(239,246,255,0.96)",
            color: CAREER_BLUE_DEEP,
            fontSize: 11.5,
            fontWeight: 950,
            cursor: "pointer",
          }}
        >
          Select
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 8,
        zIndex: 10,
        padding: "10px 11px",
        borderRadius: 18,
        border: "1px solid rgba(29,78,216,0.16)",
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 16px 32px rgba(15,23,42,0.10)",
        backdropFilter: "blur(12px)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: CAREER_TEXT }}>
        Select candidates to compare
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          type="button"
          onClick={onOpenCompare}
          disabled={selectedCount < 2}
          style={{
            minHeight: 38,
            borderRadius: 14,
            border: "1px solid rgba(29,78,216,0.18)",
            background:
              selectedCount >= 2
                ? "linear-gradient(135deg, #1e3a8a, #2563eb)"
                : "rgba(241,245,249,0.9)",
            color: selectedCount >= 2 ? "#fff" : CAREER_MUTED,
            fontSize: 12,
            fontWeight: 950,
            cursor: selectedCount >= 2 ? "pointer" : "not-allowed",
            boxShadow: selectedCount >= 2 ? "0 12px 24px rgba(29,78,216,0.18)" : "none",
          }}
        >
          Compare {selectedCount}
        </button>

        <button
          type="button"
          onClick={onCancelCompare}
          style={{
            minHeight: 38,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.20)",
            background: "rgba(255,255,255,0.92)",
            color: CAREER_TEXT,
            fontSize: 12,
            fontWeight: 950,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
