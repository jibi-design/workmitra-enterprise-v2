// App name: Job Mitra
// File name: EmployerFavoritesSearch.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerFavoritesSearch.tsx

type EmployerFavoritesSearchProps = {
  show: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function EmployerFavoritesSearch({
  show,
  search,
  onSearchChange,
}: EmployerFavoritesSearchProps) {
  if (!show) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <input
        className="wm-input"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or Job Mitra ID..."
      />
    </div>
  );
}
