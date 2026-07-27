// App name: Job Mitra | MyShiftWorkspacesSearch.tsx

type MyShiftWorkspacesSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function MyShiftWorkspacesSearch({ query, onQueryChange }: MyShiftWorkspacesSearchProps) {
  return (
    <div className="wm-field wm-shift-surface-glass" style={{ padding: "10px 12px" }}>
      <div className="wm-label">Search groups</div>
      <input
        className="wm-input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Company, job, or location"
        aria-label="Search groups"
        data-testid="shift-workspaces-search"
      />
    </div>
  );
}
