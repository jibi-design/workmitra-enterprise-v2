// App: Job Mitra / WorkMitra_Enterprise_v2
// File: FavoriteWorkerMetaRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\favoriteWorkerCard\FavoriteWorkerMetaRow.tsx

import type { FavoriteWorker } from "../../storage/favoritesStorage";

type Props = {
  favorite: FavoriteWorker;
};

export function FavoriteWorkerMetaRow({ favorite }: Props) {
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <FavoriteStars avg={favorite.avgStars} />

      <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
        {favorite.shiftsWorked} shift{favorite.shiftsWorked !== 1 ? "s" : ""} worked
      </span>

      {favorite.jobTitle && (
        <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{favorite.jobTitle}</span>
      )}
    </div>
  );
}

function FavoriteStars({ avg }: { avg: number }) {
  if (avg === 0) {
    return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No ratings yet</span>;
  }

  return (
    <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>{avg.toFixed(1)} rating</span>
  );
}
