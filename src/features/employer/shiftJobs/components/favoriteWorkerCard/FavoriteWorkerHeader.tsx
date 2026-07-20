// App: Job Mitra / WorkMitra_Enterprise_v2
// File: FavoriteWorkerHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\favoriteWorkerCard\FavoriteWorkerHeader.tsx

import type { FavoriteWorker } from "../../storage/favoritesStorage";

type Props = {
  favorite: FavoriteWorker;
};

export function FavoriteWorkerHeader({ favorite }: Props) {
  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--wm-er-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {favorite.workerName}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "var(--wm-er-accent-shift, #16a34a)",
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          {favorite.workerWmId}
        </div>
      </div>

      <FavoriteSourceBadge favorite={favorite} />
    </div>
  );
}

function FavoriteSourceBadge({ favorite }: { favorite: FavoriteWorker }) {
  const isHireAgain = favorite.addedVia === "hire_again_rating";

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 999,
        flexShrink: 0,
        background: isHireAgain ? "rgba(22,163,74,0.08)" : "rgba(148,163,184,0.08)",
        color: isHireAgain ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-muted)",
        border: isHireAgain ? "1px solid rgba(22,163,74,0.2)" : "1px solid var(--wm-er-border)",
      }}
    >
      {isHireAgain ? "Hire Again" : "Manual"}
    </span>
  );
}
