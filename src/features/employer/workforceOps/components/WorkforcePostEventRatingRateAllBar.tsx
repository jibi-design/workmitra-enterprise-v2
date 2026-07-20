// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforcePostEventRatingRateAllBar.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforcePostEventRatingRateAllBar.tsx

type Props = {
  ratedCount: number;
  activeMemberCount: number;
  onRateAll: (rating: number) => void;
};

export function WorkforcePostEventRatingRateAllBar({
  ratedCount,
  activeMemberCount,
  onRateAll,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 8,
        background: "rgba(180,83,9,0.06)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--wm-er-accent-workforce, #b45309)",
        }}
      >
        Rate all:
      </span>

      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRateAll(value)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid var(--wm-er-border)",
              background: "#fff",
              color: "var(--wm-er-accent-workforce, #b45309)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {value}
          </button>
        ))}
      </div>

      <span style={{ fontSize: 11, color: "var(--wm-er-muted)", marginLeft: "auto" }}>
        {ratedCount}/{activeMemberCount} rated
      </span>
    </div>
  );
}
