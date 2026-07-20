// App name: Job Mitra
// File name: EmployerFavoritesHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoritesHeader.tsx

type EmployerFavoritesHeaderProps = {
  totalFavorites: number;
};

export function EmployerFavoritesHeader({ totalFavorites }: EmployerFavoritesHeaderProps) {
  return (
    <div className="wm-pageHead">
      <div>
        <div className="wm-pageTitle">My Favorites</div>
        <div className="wm-pageSub">Workers you want to hire again</div>
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: 999,
          background: "rgba(22,163,74,0.08)",
          color: "var(--wm-er-accent-shift, #16a34a)",
          border: "1px solid rgba(22,163,74,0.2)",
        }}
      >
        {totalFavorites} saved
      </span>
    </div>
  );
}
