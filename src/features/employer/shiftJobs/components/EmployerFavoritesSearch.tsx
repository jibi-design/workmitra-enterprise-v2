// App name: Job Mitra | EmployerFavoritesSearch.tsx — glass (Wave 3)

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
    <div className="wm-shift-surface-glass wm-shift-surface-glass--compact">
      <input
        className="wm-input"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or Mitra Labs ID..."
        aria-label="Search favorites"
      />
    </div>
  );
}
