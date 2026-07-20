// App name: Job Mitra
// File name: EmployerFavoritesEmptyState.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoritesEmptyState.tsx

type EmployerFavoritesEmptyStateProps = {
  show: boolean;
};

export function EmployerFavoritesEmptyState({ show }: EmployerFavoritesEmptyStateProps) {
  if (!show) return null;

  return (
    <div className="wm-er-card" style={{ marginTop: 12, padding: 28, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
        No favorites yet
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.6 }}>
        Rate a worker and select &ldquo;Hire Again&rdquo; to automatically add them here. Or add by
        Job Mitra ID above.
      </div>
    </div>
  );
}
